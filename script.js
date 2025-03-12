// 海洋動物資料
const animals = [
    {
        name: "penguin",
        image: "images/penguin.png",
        translation: "企鵝"
    },
    {
        name: "dolphin",
        image: "images/dolphin.png",
        translation: "海豚"
    },
    {
        name: "shark",
        image: "images/shark.png",
        translation: "鯊魚"
    },
    {
        name: "whale",
        image: "images/whale.png",
        translation: "鯨魚"
    }
];

// 選取DOM元素
const card = document.querySelector('.card');
const animalImage = document.getElementById('animal-image');
const animalWord = document.getElementById('animal-word');
const flipBtn = document.getElementById('flip-btn');
const speakBtn = document.getElementById('speak-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');

let currentAnimalIndex = 0;
let isFlipped = false;

// 初始化遊戲
function initGame() {
    showAnimal(currentAnimalIndex);
    updateProgressBar();
}

// 顯示動物
function showAnimal(index) {
    const animal = animals[index];
    animalImage.src = animal.image;
    animalImage.alt = animal.name;
    animalWord.textContent = `${animal.name}\n${animal.translation}`;
    
    // 確保卡片正面朝上
    isFlipped = false;
    card.classList.remove('flipped');
}

// 朗讀單字
function speakWord() {
    const animalName = animals[currentAnimalIndex].name;
    const utterance = new SpeechSynthesisUtterance(animalName);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // 速度稍慢，適合小孩學習
    speechSynthesis.speak(utterance);
}

// 翻轉卡片
function flipCard() {
    card.classList.toggle('flipped');
    isFlipped = !isFlipped;
}

// 下一個單字
function nextAnimal() {
    currentAnimalIndex = (currentAnimalIndex + 1) % animals.length;
    showAnimal(currentAnimalIndex);
    updateProgressBar();
}

// 更新進度條
function updateProgressBar() {
    const progress = ((currentAnimalIndex + 1) / animals.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// 事件監聽
flipBtn.addEventListener('click', flipCard);
speakBtn.addEventListener('click', speakWord);
nextBtn.addEventListener('click', nextAnimal);
card.addEventListener('click', flipCard);

// 鍵盤控制
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case ' ':  // 空白鍵
            flipCard();
            break;
        case 'ArrowRight':  // 右箭頭
            nextAnimal();
            break;
        case 's':  // S鍵發音
            speakWord();
            break;
    }
});

// 初始化遊戲
initGame();

// 預加載所有圖片
animals.forEach(animal => {
    const img = new Image();
    img.src = animal.image;
});
