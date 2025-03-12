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

// 要下載的圖片列表
const imagesToDownload = [
  {
    url: 'https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/back.png',
    filename: 'card-back.png'
  },
  {
    url: 'https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_spades.png',
    filename: 'card-spades-ace.png'
  },
  {
    url: 'https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_hearts.png',
    filename: 'card-hearts-ace.png'
  },
  {
    url: 'https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_diamonds.png',
    filename: 'card-diamonds-ace.png'
  },
  {
    url: 'https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/ace_of_clubs.png',
    filename: 'card-clubs-ace.png'
  }
];

// 確保圖片目錄存在
const imagesDir = __dirname;
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 下載所有圖片
async function downloadAllImages() {
  console.log('開始下載卡牌圖片...');
  
  for (const image of imagesToDownload) {
    const filepath = path.join(imagesDir, image.filename);
    try {
      await downloadImage(image.url, filepath);
      console.log(`成功下載: ${image.filename}`);
    } catch (error) {
      console.error(`下載 ${image.filename} 失敗: ${error.message}`);
    }
  }
  
  console.log('所有圖片下載完成！');
}

// 執行下載
downloadAllImages();
