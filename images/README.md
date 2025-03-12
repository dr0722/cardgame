# 卡牌遊戲圖片資源

本目錄包含卡牌遊戲所需的圖片資源。

## 從網路下載圖片

您可以使用以下方法從網路下載圖片並添加到專案中：

### 使用現有下載腳本

本專案已包含兩個下載腳本，您可以直接執行它們來下載預設的卡牌圖片：

#### JavaScript 版本
```bash
node download_images.js
```

#### Python 版本
```bash
python download_images.py
```

這些腳本會自動下載幾張基本的卡牌圖片到當前目錄。

### 自訂下載（Node.js）

```javascript
const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * 從URL下載圖片並保存到指定路徑
 * @param {string} url - 圖片的URL
 * @param {string} filepath - 保存圖片的本地路徑
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下載失敗，狀態碼: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`圖片已保存至: ${filepath}`);
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // 刪除不完整的文件
        reject(err);
      });
    }).on('error', reject);
  });
}

// 使用範例
// downloadImage('https://example.com/image.jpg', path.join(__dirname, 'card-back.png'))
//   .then(filepath => console.log(`成功下載圖片: ${filepath}`))
//   .catch(error => console.error(`下載失敗: ${error.message}`));
```

### 使用 Python

```python
import os
import requests

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
        return filepath
    except Exception as e:
        print(f"下載失敗: {str(e)}")
        return None

# 使用範例
# image_url = 'https://example.com/image.jpg'
# save_path = os.path.join(os.path.dirname(__file__), 'card-front.png')
# download_image(image_url, save_path)
```

## 圖片命名規範

為了保持一致性，請按照以下命名規則添加圖片：

- 卡牌背面: `card-back.png`
- 卡牌正面: `card-<suit>-<value>.png`（例如：`card-hearts-ace.png`）
- 遊戲介面元素: `ui-<element-name>.png`（例如：`ui-button.png`）

## 圖片資源來源

使用外部圖片資源時，請確保您有合法權限使用這些圖片，並在下方列出圖片來源：

- [Playing Cards Assets](https://github.com/hayeah/playing-cards-assets) - MIT 授權

## 注意事項

- 請使用PNG或JPG格式的圖片
- 建議卡牌圖片尺寸為300x450像素
- 圖片大小應小於500KB以確保遊戲載入速度
