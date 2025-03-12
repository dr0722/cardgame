import os
import requests
import concurrent.futures
import time
from io import BytesIO

def download_image(url, filepath):
    """
    從URL下載圖片並保存到指定路徑
    
    Args:
        url (str): 圖片的URL
        filepath (str): 保存圖片的本地路徑
    """
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
                
        print(f"圖片已保存至: {filepath}")
        return True
    except Exception as e:
        print(f"下載失敗 {url}: {str(e)}")
        return False

# 使用備選圖片來源
images_to_download = [
    {
        "url": "https://openclipart.org/download/282614/1495146125.svg",
        "filename": "ocean-shark.png",
        "fallback_url": "https://freesvg.org/img/1526017993.png"
    },
    {
        "url": "https://openclipart.org/download/226095/Cartoon-Octopus.svg",
        "filename": "ocean-octopus.png",
        "fallback_url": "https://freesvg.org/img/Octopus-by-Rones.png"
    },
    {
        "url": "https://openclipart.org/download/285200/1502384081.svg",
        "filename": "ocean-turtle.png",
        "fallback_url": "https://freesvg.org/img/1534454216.png"
    },
    {
        "url": "https://openclipart.org/download/169312/jellyfish.svg",
        "filename": "ocean-jellyfish.png",
        "fallback_url": "https://freesvg.org/img/1538063579.png"
    },
    {
        "url": "https://openclipart.org/download/304307/1526017993.svg",
        "filename": "ocean-clownfish.png",
        "fallback_url": "https://freesvg.org/img/clownfish.png"
    },
    {
        "url": "https://openclipart.org/download/325242/dolphin.svg",
        "filename": "ocean-dolphin.png",
        "fallback_url": "https://freesvg.org/img/dolphin-silhouette.png"
    },
    {
        "url": "https://openclipart.org/download/279910/1494961085.svg",
        "filename": "ocean-whale.png",
        "fallback_url": "https://freesvg.org/img/1539016128.png"
    },
    {
        "url": "https://openclipart.org/download/223647/Crab-001.svg",
        "filename": "ocean-crab.png",
        "fallback_url": "https://freesvg.org/img/Crab-by-Rones.png"
    }
]

def download_image_with_fallback(image):
    """
    嘗試從主要URL下載圖片，如果失敗則使用備用URL
    
    Args:
        image (dict): 包含圖片URL和檔案名的字典
    """
    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), image["filename"])
    
    # 嘗試主要URL
    print(f"嘗試下載: {image['filename']} 從 {image['url']}")
    try:
        # 添加重試機制
        for attempt in range(3):
            try:
                response = requests.get(image["url"], stream=True, timeout=15)
                response.raise_for_status()
                
                with open(filepath, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)
                
                print(f"成功下載: {image['filename']}")
                return True
            except requests.RequestException as e:
                if attempt < 2:  # 嘗試次數小於最大次數
                    print(f"下載失敗，重試中... ({attempt+1}/3)")
                    time.sleep(2)  # 等待2秒再重試
                else:
                    raise e
    except Exception as e:
        print(f"主要來源下載失敗: {str(e)}")
        
        # 嘗試備用URL
        if "fallback_url" in image and image["fallback_url"]:
            print(f"嘗試使用備用來源: {image['fallback_url']}")
            try:
                response = requests.get(image["fallback_url"], stream=True, timeout=15)
                response.raise_for_status()
                
                with open(filepath, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)
                
                print(f"成功從備用來源下載: {image['filename']}")
                return True
            except Exception as fallback_error:
                print(f"備用來源下載失敗: {str(fallback_error)}")
        
        # 如果兩個來源都失敗，創建預設圖片
        try:
            print(f"創建預設圖片: {image['filename']}")
            create_default_image(filepath, image["filename"])
            return True
        except Exception as default_error:
            print(f"無法創建預設圖片: {str(default_error)}")
            return False

def create_default_image(filepath, filename):
    """
    創建一個簡單的預設圖片（純藍色背景與文字）
    """
    svg_content = f"""
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#87CEEB" />
        <text x="150" y="150" font-family="Arial" font-size="24" fill="black" text-anchor="middle" alignment-baseline="middle">
            {filename.replace('.png', '')}
        </text>
    </svg>
    """
    
    svg_filepath = filepath.replace('.png', '.svg')
    with open(svg_filepath, 'w') as file:
        file.write(svg_content)
    
    print(f"已創建預設SVG圖片: {svg_filepath}")

def main():
    # 確保圖片目錄存在
    images_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(images_dir, exist_ok=True)
    
    print("開始下載海洋動物圖片...")
    
    # 使用多線程下載所有圖片
    success_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(download_image_with_fallback, image): image for image in images_to_download}
        
        for future in concurrent.futures.as_completed(futures):
            if future.result():
                success_count += 1
    
    print(f"海洋動物圖片下載完成！成功: {success_count}/{len(images_to_download)}")

if __name__ == "__main__":
    main()
