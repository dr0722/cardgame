const words = ["penguin", "dolphin", "shark", "whale"];
let currentIndex = 0;

const flashcard = document.getElementById("flashcard");
const wordElement = document.getElementById("word");
const nextButton = document.getElementById("nextButton");

nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % words.length;
    wordElement.textContent = words[currentIndex];
});
