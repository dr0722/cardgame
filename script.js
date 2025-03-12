// Array of animal words for the game
const animalWords = ["cat", "dog", "bird", "fish", "frog", "bear", "lion", "tiger", "wolf", "deer", "fox", "rabbit"];

// Game variables
let score = 0;
let currentWord = null;
const gameArea = document.getElementById("game-area");
const userInput = document.getElementById("user-input");
const checkButton = document.getElementById("check-button");
const scoreDisplay = document.getElementById("score");
const messageEl = document.getElementById("message");

// Initialize the game
initializeGame();

function initializeGame() {
    // Create trees and rocks with hidden animal words
    createForestElements();
    
    // Add event listener to check button
    checkButton.addEventListener("click", checkAnswer);
    
    // Add event listener for Enter key
    userInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
}

function createForestElements() {
    // Create 5 trees
    for (let i = 0; i < 5; i++) {
        createTree(animalWords[i]);
    }
    
    // Create 3 rocks
    for (let i = 5; i < 8; i++) {
        createRock(animalWords[i]);
    }
}

function createTree(word) {
    const tree = document.createElement("div");
    tree.className = "tree";
    
    // Random position within the game area
    const left = Math.floor(Math.random() * 70) + 5; // 5% to 75% from left
    const top = Math.floor(Math.random() * 60) + 5;  // 5% to 65% from top
    
    tree.style.left = left + "%";
    tree.style.top = top + "%";
    
    // Create word element
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    wordEl.textContent = word;
    tree.appendChild(wordEl);
    
    // Add click event
    tree.addEventListener("click", function() {
        revealWord(wordEl);
    });
    
    gameArea.appendChild(tree);
}

function createRock(word) {
    const rock = document.createElement("div");
    rock.className = "rock";
    
    // Random position within the game area
    const left = Math.floor(Math.random() * 70) + 5; // 5% to 75% from left
    const top = Math.floor(Math.random() * 60) + 30; // 30% to 90% from top
    
    rock.style.left = left + "%";
    rock.style.top = top + "%";
    
    // Create word element
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    wordEl.textContent = word;
    rock.appendChild(wordEl);
    
    // Add click event
    rock.addEventListener("click", function() {
        revealWord(wordEl);
    });
    
    gameArea.appendChild(rock);
}

function revealWord(wordElement) {
    // Hide any previously revealed words
    const revealedWords = document.querySelectorAll(".word.revealed");
    revealedWords.forEach(el => {
        if (el !== wordElement) {
            el.classList.remove("revealed");
        }
    });
    
    // Reveal the clicked word
    wordElement.classList.toggle("revealed");
    
    // Set current word if revealed, otherwise set to null
    if (wordElement.classList.contains("revealed")) {
        currentWord = wordElement.textContent;
        messageEl.textContent = "Type this word to earn points!";
        userInput.focus();
    } else {
        currentWord = null;
        messageEl.textContent = "";
    }
}

function checkAnswer() {
    if (!currentWord) {
        messageEl.textContent = "Click on a tree or rock to find a hidden word first!";
        return;
    }
    
    const userAnswer = userInput.value.trim().toLowerCase();
    
    if (userAnswer === currentWord.toLowerCase()) {
        // Correct answer
        score += 10;
        scoreDisplay.textContent = score;
        messageEl.textContent = "Correct! +10 points";
        messageEl.style.color = "green";
        
        // Hide the revealed word
        const revealedWord = document.querySelector(".word.revealed");
        if (revealedWord) {
            revealedWord.classList.remove("revealed");
            
            // Remove the parent element (tree or rock)
            setTimeout(() => {
                revealedWord.parentElement.style.opacity = "0.2";
                revealedWord.parentElement.style.pointerEvents = "none";
            }, 500);
        }
        
        currentWord = null;
    } else {
        // Wrong answer
        messageEl.textContent = "Try again!";
        messageEl.style.color = "red";
    }
    
    // Clear input field
    userInput.value = "";
    userInput.focus();
    
    // Check if all words have been found
    checkGameEnd();
}

function checkGameEnd() {
    const activeElements = document.querySelectorAll(".tree:not([style*='opacity: 0.2']), .rock:not([style*='opacity: 0.2'])");
    
    if (activeElements.length === 0) {
        setTimeout(() => {
            alert(`Congratulations! You found all the words! Final score: ${score}`);
            // Restart game
            resetGame();
        }, 1000);
    }
}

function resetGame() {
    gameArea.innerHTML = "";
    score = 0;
    scoreDisplay.textContent = score;
    messageEl.textContent = "";
    currentWord = null;
    
    // Create new forest elements
    createForestElements();
}
