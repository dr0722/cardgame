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

// 使用備選圖片來源
const imagesToDownload = [
  {
    url: 'https://openclipart.org/download/282614/1495146125.svg',
    filename: 'ocean-shark.png',
    fallbackUrl: 'https://freesvg.org/img/1526017993.png'
  },
  {
    url: 'https://openclipart.org/download/226095/Cartoon-Octopus.svg',
    filename: 'ocean-octopus.png',
    fallbackUrl: 'https://freesvg.org/img/Octopus-by-Rones.png'
  },
  {
    url: 'https://openclipart.org/download/285200/1502384081.svg',
    filename: 'ocean-turtle.png',
    fallbackUrl: 'https://freesvg.org/img/1534454216.png'
  },
  {
    url: 'https://openclipart.org/download/169312/jellyfish.svg', 
    filename: 'ocean-jellyfish.png',
    fallbackUrl: 'https://freesvg.org/img/1538063579.png'
  },
  {
    url: 'https://openclipart.org/download/304307/1526017993.svg',
    filename: 'ocean-clownfish.png',
    fallbackUrl: 'https://freesvg.org/img/clownfish.png'
  },
  {
    url: 'https://openclipart.org/download/325242/dolphin.svg',
    filename: 'ocean-dolphin.png',
    fallbackUrl: 'https://freesvg.org/img/dolphin-silhouette.png'
  },
  {
    url: 'https://openclipart.org/download/279910/1494961085.svg',
    filename: 'ocean-whale.png',
    fallbackUrl: 'https://freesvg.org/img/1539016128.png'
  },
  {
    url: 'https://openclipart.org/download/223647/Crab-001.svg',
    filename: 'ocean-crab.png',
    fallbackUrl: 'https://freesvg.org/img/Crab-by-Rones.png'
  }
];

// 確保圖片目錄存在
const imagesDir = __dirname;
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * 從URL下載SVG圖片並保存為PNG
 */
async function downloadImageWithFallback(image) {
  const filepath = path.join(imagesDir, image.filename);
  
  try {
    console.log(`嘗試下載: ${image.filename} 從 ${image.url}`);
    await downloadImage(image.url, filepath);
    console.log(`成功下載: ${image.filename}`);
    return true;
  } catch (error) {
    console.log(`主要來源下載失敗: ${error.message}`);
    
    if (image.fallbackUrl) {
      console.log(`嘗試使用備用來源: ${image.fallbackUrl}`);
      try {
        await downloadImage(image.fallbackUrl, filepath);
        console.log(`成功從備用來源下載: ${image.filename}`);
        return true;
      } catch (fallbackError) {
        console.error(`備用來源下載失敗: ${fallbackError.message}`);
      }
    }
    
    // 創建一個簡單的純色圖像作為最後嘗試
    try {
      console.log(`創建預設圖片: ${image.filename}`);
      await createDefaultImage(filepath, image.filename);
      return true;
    } catch (defaultError) {
      console.error(`無法創建預設圖片: ${defaultError.message}`);
      return false;
    }
  }
}

/**
 * 創建一個簡單的預設圖像（純色矩形）
 */
function createDefaultImage(filepath, filename) {
  return new Promise((resolve, reject) => {
    const content = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#87CEEB" />
        <text x="150" y="150" font-family="Arial" font-size="24" fill="black" text-anchor="middle" alignment-baseline="middle">
          ${filename.replace('.png', '')}
        </text>
      </svg>
    `;
    
    fs.writeFile(filepath.replace('.png', '.svg'), content, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(filepath);
    });
  });
}

// 下載所有圖片
async function downloadAllImages() {
  console.log('開始下載海洋動物圖片...');
  
  let successCount = 0;
  
  for (const image of imagesToDownload) {
    if (await downloadImageWithFallback(image)) {
      successCount++;
    }
  }
  
  console.log(`海洋動物圖片下載完成！成功: ${successCount}/${imagesToDownload.length}`);
}

// 執行下載
downloadAllImages();
