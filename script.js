// Game variables
let animalWords = [];
let currentLevel = 1;
let maxLevel = 3;
let score = 0;
let levelScore = 0;
let currentWord = null;
let timer = null;
let timeLeft = 60;
let difficulty = 'medium'; // Default difficulty
let gameState = 'menu'; // menu, playing, paused, gameover, levelcomplete
let wordVisibilityDuration = 2000; // ms
let hintsAvailable = 3;

// Game elements
const gameArea = document.getElementById("game-area");
const userInput = document.getElementById("user-input");
const checkButton = document.getElementById("check-button");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const timeDisplay = document.getElementById("time");
const messageEl = document.getElementById("message");
const hintBtn = document.getElementById("hint-btn");
const hintText = document.getElementById("hint-text");
const pauseBtn = document.getElementById("pause-btn");
const finalScoreValue = document.getElementById("final-score-value");
const levelScoreValue = document.getElementById("level-score-value");

// Screens
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const pauseScreen = document.getElementById("pause-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const levelCompleteScreen = document.getElementById("level-complete-screen");

// Sounds
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const revealSound = document.getElementById("reveal-sound");
const levelUpSound = document.getElementById("level-up-sound");
const gameOverSound = document.getElementById("game-over-sound");

// Difficulty configurations
const difficultySettings = {
    easy: {
        timeLimit: 90,
        wordCount: 5,
        wordVisibilityDuration: 3000,
        hintsAvailable: 5,
        pointsPerWord: 5
    },
    medium: {
        timeLimit: 60,
        wordCount: 8,
        wordVisibilityDuration: 2000,
        hintsAvailable: 3,
        pointsPerWord: 10
    },
    hard: {
        timeLimit: 45,
        wordCount: 12,
        wordVisibilityDuration: 1000,
        hintsAvailable: 1,
        pointsPerWord: 15
    }
};

// Ocean images for animal representations
const oceanImages = [
    'images/ocean-clownfish.png',
    'images/ocean-crab.png',
    'images/ocean-dolphin.png',
    'images/ocean-jellyfish.png',
    'images/ocean-octopus.png',
    'images/ocean-shark.png',
    'images/ocean-turtle.png',
    'images/ocean-whale.png'
];

// Initialize the game
initializeGame();

// Function to load animal words from text file
async function loadAnimalWords() {
    try {
        const response = await fetch('animal_words.txt');
        const text = await response.text();
        animalWords = text.split('\n').filter(word => word.trim() !== '');
        console.log('Loaded animal words:', animalWords);
    } catch (error) {
        console.error('Error loading animal words:', error);
        // Fallback to default words if loading fails
        animalWords = ["cat", "dog", "bird", "fish", "frog", "bear", "lion", "tiger", "wolf", "deer", "fox", "rabbit"];
    }
}

function initializeGame() {
    // Set up event listeners for menu buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            difficulty = btn.dataset.difficulty;
        });
    });
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('resume-btn').addEventListener('click', resumeGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('menu-btn').addEventListener('click', showMainMenu);
    document.getElementById('try-again-btn').addEventListener('click', restartGame);
    document.getElementById('return-menu-btn').addEventListener('click', showMainMenu);
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    
    checkButton.addEventListener('click', checkAnswer);
    pauseBtn.addEventListener('click', pauseGame);
    hintBtn.addEventListener('click', giveHint);
    
    userInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Load animal words from file
    loadAnimalWords();
}

function startGame() {
    // Apply difficulty settings
    const settings = difficultySettings[difficulty];
    timeLeft = settings.timeLimit;
    wordVisibilityDuration = settings.wordVisibilityDuration;
    hintsAvailable = settings.hintsAvailable;
    
    // Set up the game state
    currentLevel = 1;
    score = 0;
    levelScore = 0;
    gameState = 'playing';
    
    // Update displays
    scoreDisplay.textContent = score;
    levelDisplay.textContent = currentLevel;
    timeDisplay.textContent = timeLeft;
    
    // Show game screen
    hideAllScreens();
    gameScreen.classList.remove('hidden');
    
    // Set up game area
    setupLevel();
    
    // Start timer
    startTimer();
}

function setupLevel() {
    // Clear game area
    gameArea.innerHTML = '';
    
    // Shuffle and select words for this level
    const shuffledWords = [...animalWords].sort(() => Math.random() - 0.5);
    const settings = difficultySettings[difficulty];
    
    // Adjust word count based on level
    const wordCount = Math.min(settings.wordCount + (currentLevel - 1) * 2, animalWords.length);
    const levelWords = shuffledWords.slice(0, wordCount);
    
    // Create forest elements
    const treeCount = Math.ceil(wordCount * 0.6); // 60% trees
    const rockCount = Math.ceil(wordCount * 0.2); // 20% rocks
    const animalCount = wordCount - treeCount - rockCount; // Remaining as animals
    
    // Create elements
    let wordIndex = 0;
    
    // Create trees
    for (let i = 0; i < treeCount; i++) {
        if (wordIndex < levelWords.length) {
            createTree(levelWords[wordIndex++]);
        }
    }
    
    // Create rocks
    for (let i = 0; i < rockCount; i++) {
        if (wordIndex < levelWords.length) {
            createRock(levelWords[wordIndex++]);
        }
    }
    
    // Create animals
    for (let i = 0; i < animalCount; i++) {
        if (wordIndex < levelWords.length) {
            createAnimal(levelWords[wordIndex++]);
        }
    }
    
    // Reset level score
    levelScore = 0;
    
    // Reset message
    messageEl.textContent = `Find and type ${wordCount} hidden animal words!`;
    messageEl.style.color = 'black';
    
    // Reset hint text
    hintText.textContent = '';
    hintBtn.textContent = `Hint (${hintsAvailable} left)`;
}

function createTree(word) {
    const tree = document.createElement('div');
    tree.className = 'tree';
    
    // Random position within the game area
    const left = Math.floor(Math.random() * 70) + 5; // 5% to 75% from left
    const top = Math.floor(Math.random() * 60) + 5;  // 5% to 65% from top
    
    tree.style.left = left + '%';
    tree.style.top = top + '%';
    
    // Create word element
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.textContent = word;
    wordEl.dataset.word = word;
    tree.appendChild(wordEl);
    
    // Add click event
    tree.addEventListener('click', function() {
        revealWord(wordEl);
    });
    
    gameArea.appendChild(tree);
}

function createRock(word) {
    const rock = document.createElement('div');
    rock.className = 'rock';
    
    // Random position within the game area
    const left = Math.floor(Math.random() * 70) + 5; // 5% to 75% from left
    const top = Math.floor(Math.random() * 40) + 50; // 50% to 90% from top
    
    rock.style.left = left + '%';
    rock.style.top = top + '%';
    
    // Create word element
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.textContent = word;
    wordEl.dataset.word = word;
    rock.appendChild(wordEl);
    
    // Add click event
    rock.addEventListener('click', function() {
        revealWord(wordEl);
    });
    
    gameArea.appendChild(rock);
}

function createAnimal(word) {
    const animal = document.createElement('div');
    animal.className = 'animal';
    
    // Random position within the game area
    const left = Math.floor(Math.random() * 80) + 10; // 10% to 90% from left
    const top = Math.floor(Math.random() * 80) + 10;  // 10% to 90% from top
    
    animal.style.left = left + '%';
    animal.style.top = top + '%';
    
    // Create random animal image
    const img = document.createElement('img');
    img.src = oceanImages[Math.floor(Math.random() * oceanImages.length)];
    animal.appendChild(img);
    
    // Create word element
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.textContent = word;
    wordEl.dataset.word = word;
    animal.appendChild(wordEl);
    
    // Add click event
    animal.addEventListener('click', function() {
        revealWord(wordEl);
    });
    
    gameArea.appendChild(animal);
}

function revealWord(wordElement) {
    if (gameState !== 'playing') return;
    
    // Play sound
    revealSound.play();
    
    // Hide any previously revealed words
    const revealedWords = document.querySelectorAll('.word.revealed');
    revealedWords.forEach(el => {
        if (el !== wordElement) {
            el.classList.remove('revealed');
        }
    });
    
    // Reveal the clicked word
    wordElement.classList.add('revealed');
    
    // Set current word if revealed
    if (wordElement.classList.contains('revealed')) {
        currentWord = wordElement.dataset.word;
        messageEl.textContent = 'Type this word to earn points!';
        messageEl.style.color = 'black';
        userInput.focus();
        
        // Auto-hide word after a delay based on difficulty
        setTimeout(() => {
            if (wordElement.classList.contains('revealed')) {
                wordElement.classList.remove('revealed');
                wordElement.parentElement.classList.add('flash');
                setTimeout(() => {
                    wordElement.parentElement.classList.remove('flash');
                }, 1000);
            }
        }, wordVisibilityDuration);
    } else {
        currentWord = null;
        messageEl.textContent = '';
    }
}

function checkAnswer() {
    if (gameState !== 'playing') return;
    
    if (!currentWord) {
        messageEl.textContent = 'Click on a tree, rock, or animal to find a hidden word first!';
        messageEl.style.color = 'black';
        return;
    }
    
    const userAnswer = userInput.value.trim().toLowerCase();
    
    if (userAnswer === currentWord.toLowerCase()) {
        // Correct answer
        correctSound.play();
        const pointsPerWord = difficultySettings[difficulty].pointsPerWord;
        score += pointsPerWord;
        levelScore += pointsPerWord;
        scoreDisplay.textContent = score;
        messageEl.textContent = `Correct! +${pointsPerWord} points`;
        messageEl.style.color = 'green';
        
        // Hide the revealed word
        const revealedWord = document.querySelector('.word.revealed');
        if (revealedWord) {
            revealedWord.classList.remove('revealed');
            
            // Remove the parent element (tree, rock, or animal)
            setTimeout(() => {
                revealedWord.parentElement.style.opacity = '0.2';
                revealedWord.parentElement.style.pointerEvents = 'none';
            }, 500);
        }
        
        currentWord = null;
        
        // Check if level is complete
        checkLevelComplete();
    } else {
        // Wrong answer
        wrongSound.play();
        messageEl.textContent = 'Try again!';
        messageEl.style.color = 'red';
    }
    
    // Clear input field
    userInput.value = '';
    userInput.focus();
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (gameState === 'playing') {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            
            // Warning when time is running out
            if (timeLeft <= 10) {
                timeDisplay.classList.add('warning');
            } else {
                timeDisplay.classList.remove('warning');
            }
            
            // Game over when time runs out
            if (timeLeft <= 0) {
                endGame();
            }
        }
    }, 1000);
}

function checkLevelComplete() {
    const activeElements = document.querySelectorAll(".tree:not([style*='opacity: 0.2']), .rock:not([style*='opacity: 0.2']), .animal:not([style*='opacity: 0.2'])");
    
    if (activeElements.length === 0) {
        // Level complete
        levelCompleted();
    }
}

function levelCompleted() {
    clearInterval(timer);
    gameState = 'levelcomplete';
    
    // Play level up sound
    levelUpSound.play();
    
    // Update level score
    levelScoreValue.textContent = levelScore;
    
    // Add time bonus
    const timeBonus = timeLeft * 2;
    score += timeBonus;
    scoreDisplay.textContent = score;
    
    // Hide game screen and show level complete screen
    hideAllScreens();
    levelCompleteScreen.classList.remove('hidden');
    
    // Check if game is complete (all levels done)
    if (currentLevel >= maxLevel) {
        // Show final score
        finalScoreValue.textContent = score;
        
        // Hide level complete screen and show game over screen
        setTimeout(() => {
            hideAllScreens();
            gameOverScreen.classList.remove('hidden');
        }, 3000);
    }
}

function nextLevel() {
    currentLevel++;
    levelDisplay.textContent = currentLevel;
    
    // Increase difficulty for higher levels
    const settings = difficultySettings[difficulty];
    timeLeft = settings.timeLimit - (currentLevel - 1) * 5; // Reduce time by 5 seconds per level
    
    // Setup new level
    setupLevel();
    
    // Show game screen
    hideAllScreens();
    gameScreen.classList.remove('hidden');
    
    // Start timer
    startTimer();
    
    // Update game state
    gameState = 'playing';
}

function endGame() {
    clearInterval(timer);
    gameState = 'gameover';
    
    // Play game over sound
    gameOverSound.play();
    
    // Update final score
    finalScoreValue.textContent = score;
    
    // Hide game screen and show game over screen
    hideAllScreens();
    gameOverScreen.classList.remove('hidden');
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        clearInterval(timer);
        
        // Hide game screen and show pause screen
        hideAllScreens();
        pauseScreen.classList.remove('hidden');
    }
}

function resumeGame() {
    gameState = 'playing';
    
    // Hide pause screen and show game screen
    hideAllScreens();
    gameScreen.classList.remove('hidden');
    
    // Resume timer
    startTimer();
}

function restartGame() {
    // Reset game variables
    currentLevel = 1;
    score = 0;
    
    // Start game
    startGame();
}

function showMainMenu() {
    // Stop timer
    clearInterval(timer);
    
    // Reset game state
    gameState = 'menu';
    
    // Show menu screen
    hideAllScreens();
    menuScreen.classList.remove('hidden');
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
}

function giveHint() {
    if (hintsAvailable <= 0) {
        hintText.textContent = 'No hints left!';
        return;
    }
    
    // Find an active word
    const activeElements = document.querySelectorAll(".tree:not([style*='opacity: 0.2']), .rock:not([style*='opacity: 0.2']), .animal:not([style*='opacity: 0.2'])");
    
    if (activeElements.length === 0) {
        hintText.textContent = 'No more words to find!';
        return;
    }
    
    // Pick a random element and get its word
    const randomElement = activeElements[Math.floor(Math.random() * activeElements.length)];
    const wordElement = randomElement.querySelector('.word');
    const word = wordElement.dataset.word;
    
    // Show first letter of the word
    hintText.textContent = `First letter: ${word[0].toUpperCase()}`;
    
    // Flash the containing element
    randomElement.classList.add('flash');
    setTimeout(() => {
        randomElement.classList.remove('flash');
    }, 1000);
    
    // Reduce hint count
    hintsAvailable--;
    hintBtn.textContent = `Hint (${hintsAvailable} left)`;
    
    // Subtract points for using hint
    score -= 5;
    if (score < 0) score = 0;
    scoreDisplay.textContent = score;
}
