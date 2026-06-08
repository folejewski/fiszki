const SAMPLE_WORDS = [
  { pl: "dzień dobry", pt: "bom dia" },
  { pl: "dziękuję", pt: "obrigado" },
  { pl: "przepraszam", pt: "desculpe" },
  { pl: "tak", pt: "sim" },
  { pl: "nie", pt: "não" },
  { pl: "woda", pt: "água" },
  { pl: "chleb", pt: "pão" },
  { pl: "sklep", pt: "loja" },
  { pl: "ulica", pt: "rua" },
  { pl: "miasto", pt: "cidade" },
];

let allWords = [...SAMPLE_WORDS];
let wordsToPractice = [];
let learnedWords = [];
let direction = "pl-pt"; // "pl-pt", "pt-pl", or "random"
let difficulty = "easy"; // "easy" or "hard"
let currentWord = null;

// Page references
const mainPage = document.querySelector(".main-menu");
const settingsPage = document.querySelector(".settings");
const practicePage = document.querySelector(".practice");

function togglePage(pageToShow) {
    mainPage.style.display = "none";
    settingsPage.style.display = "none";
    practicePage.style.display = "none";
    pageToShow.style.display = "block";
}

// File handling
function replaceFile() {
    const fileToLoad = document.getElementById("fileInput").files[0];
    if (!fileToLoad) return;
    fileToLoad.arrayBuffer().then(buffer => {
        const fileText = new TextDecoder("utf-8").decode(buffer);
        const jsonData = JSON.parse(fileText);
        if (checkIfFileIsValid(jsonData, "pl", "pt")) {
            allWords.length = 0;
            addWordsToList(jsonData, "pl", "pt");
        }
    });
}

function uploadFile() {
    const fileToLoad = document.getElementById("fileAppend").files[0];
    if (!fileToLoad) return;
    fileToLoad.arrayBuffer().then(buffer => {
        const fileText = new TextDecoder("utf-8").decode(buffer);
        const jsonData = JSON.parse(fileText);
        if (checkIfFileIsValid(jsonData, "pl", "pt")) {
            addWordsToList(jsonData, "pl", "pt");
        }
    });
}

function checkIfFileIsValid(jsonData, firstLanguage, secondLanguage) {
    return jsonData.every(word => {
        if (!word[firstLanguage] || !word[secondLanguage]) {
            console.log(`Invalid word entry: ${JSON.stringify(word)}. Must contain '${firstLanguage}' and '${secondLanguage}' properties.`);
            return false;
        }
        return true;
    });
}

function addWordsToList(jsonData, firstLanguage, secondLanguage) {
    jsonData.forEach(word => {
        if (allWords.some(w => w[firstLanguage] === word[firstLanguage])) {
            console.log(`Word "${word[firstLanguage]}" already exists in the list.`);
        } else {
            allWords.push(word);
            console.log(`Word "${word[firstLanguage]}" added.`);
        }
    });
    // Only update max and leave the user's chosen value alone unless it now exceeds the new max
    const inputElement = document.getElementById("howManyWordsToShow");
    inputElement.max = allWords.length;
    if (parseInt(inputElement.value) > allWords.length) {
        inputElement.value = allWords.length;
    }
}

function updateMaxWordsToShow(length) {
    const inputElement = document.getElementById("howManyWordsToShow");
    inputElement.max = length;
    inputElement.value = length;
}

// Settings
function setLanguageDirection(languageDirection) {
    direction = languageDirection;
}

function setDifficulty(level) {
    difficulty = level;
}

// Practice setup
function startPractice() {
    const howMany = parseInt(document.getElementById("howManyWordsToShow").value);

    // Read selected direction from radio buttons
    const directionRadio = document.querySelector('input[name="language"]:checked');
    if (directionRadio) direction = directionRadio.value;

    // Read selected difficulty from radio buttons
    const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    if (difficultyRadio) difficulty = difficultyRadio.value;

    // Reset state
    wordsToPractice = [];

    addPracticeWords(howMany);

    if (wordsToPractice.length === 0) {
        alert("No words to practice! Check your word list and number setting.");
        return;
    }

    newWord(wordsToPractice);
    displayCard();
}

function addPracticeWords(numberOfWords) {
    if (allWords.length - learnedWords.length === 0) {
        return;
    } else if (numberOfWords > allWords.length - learnedWords.length) {
        alert("Not enough words available to practice that many! Adjusting to maximum possible.");
        numberOfWords = allWords.length - learnedWords.length;
    }

    for (let i = 0; i < numberOfWords; i++) {
        let randomIndex = Math.floor(Math.random() * allWords.length);
        if (!wordsToPractice.includes(allWords[randomIndex]) && !learnedWords.includes(allWords[randomIndex])) {
            wordsToPractice.push(allWords[randomIndex]);
            console.log(allWords[randomIndex]);
        } else {
            i--;
        }
    }
}

// Card display
function displayCard() {
    togglePage(practicePage);

    // Resolve random direction per card, without mutating the global setting
    let resolvedDirection = direction;
    if (resolvedDirection === "random") {
        resolvedDirection = Math.random() < 0.5 ? "pl-pt" : "pt-pl";
    }

    // Store resolved direction on the card so checkAnswer knows which way we went
    document.getElementById("answer-input").dataset.direction = resolvedDirection;

    const promptWord = (resolvedDirection === "pl-pt") ? currentWord.pl : currentWord.pt;
    const answerLanguage = (resolvedDirection === "pl-pt") ? "🇵🇹 Portuguese:" : "🇵🇱 Polish:";
    const promptLanguage = (resolvedDirection === "pl-pt") ? "🇵🇱 Polish" : "🇵🇹 Portuguese";

    document.getElementById("word-display").textContent = promptWord;
    document.getElementById("language-prompt").textContent = promptLanguage;
    document.getElementById("language-answer").textContent = answerLanguage;
    document.getElementById("progress").textContent = learnedWords.length + " / " + allWords.length;
    document.getElementById("remaining").textContent = wordsToPractice.length + " words left";
    document.getElementById("answer-input").value = "";
    document.getElementById("answer-input").focus();
}

// Answer checking
function handleCheckAnswer() {
    const input = document.getElementById("answer-input");
    const userInput = input.value;
    const resolvedDirection = input.dataset.direction;

    const correctAnswer = (resolvedDirection === "pl-pt") ? currentWord.pt : currentWord.pl;

    if (checkAnswer(userInput, correctAnswer)) {
        correctAnswer_handler();
    } else {
        wrongAnswer_handler(correctAnswer);
    }
}

function checkAnswer(userInput, correctAnswer) {
    if (difficulty === "hard") {
        return userInput.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    } else {
        return easyModeWord(userInput) === easyModeWord(correctAnswer);
    }
}

function easyModeWord(word) {
    return word.trim().toLowerCase()
        .replace(/[ãâáàäåæ]/g, "a")
        .replace(/[ęèéêë]/g, "e")
        .replace(/[îïíìı]/g, "i")
        .replace(/[óôöòø]/g, "o")
        .replace(/[ùúûü]/g, "u")
        .replace(/[çć]/g, "c")
        .replace(/[ńñ]/g, "n")
        .replace(/[śš]/g, "s")
        .replace(/[żźž]/g, "z")
        .replace(/[łl]/g, "l")
        .replace(/ß/g, "ss");
}

function correctAnswer_handler() {
    learnedWords.push(currentWord);
    wordsToPractice.splice(wordsToPractice.indexOf(currentWord), 1);

    if (wordsToPractice.length === 0) {
        alert("Congratulations! You've practiced all the words!");
        togglePage(mainPage);
    } else {
        newWord(wordsToPractice);
        displayCard();
    }
}

function wrongAnswer_handler(correctAnswer) {
    alert(`Wrong! The correct answer was: "${correctAnswer}". Try again later.`);
    newWord(wordsToPractice);
    displayCard();
}

function newWord(words) {
    currentWord = words[Math.floor(Math.random() * words.length)];
}

// init - runs once in the beginning
updateMaxWordsToShow(allWords.length);