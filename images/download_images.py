import os
import requests
import concurrent.futures

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

# 要下載的圖片列表
images_to_download = [
    {
        "url": "https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/back.png",
        "filename": "card-back.png"
    },
    {
        "url": "https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_spades.png",
        "filename": "card-spades-ace.png"
    },
    {
        "url": "https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_hearts.png",
        "filename": "card-hearts-ace.png"
    },
    {
        "url": "https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_diamonds.png",
        "filename": "card-diamonds-ace.png"
    },
    {
        "url": "https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_clubs.png",
        "filename": "card-clubs-ace.png"
    }
]

def main():
    # 確保圖片目錄存在
    images_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(images_dir, exist_ok=True)
    
    print("開始下載卡牌圖片...")
    
    # 使用多線程下載所有圖片
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for image in images_to_download:
            filepath = os.path.join(images_dir, image["filename"])
            futures.append(
                executor.submit(download_image, image["url"], filepath)
            )
        
        # 等待所有下載完成
        for future in concurrent.futures.as_completed(futures):
            future.result()
    
    print("所有圖片下載完成！")

if __name__ == "__main__":
    main()
