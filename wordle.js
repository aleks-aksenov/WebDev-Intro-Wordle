const BACKSPACE_KEY = "Backspace"
const ENTER_KEY = "Enter"

const WORD_OF_THE_DAY_URL = "https://words.dev-apis.com/word-of-the-day"
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"

const MAX_ATTEMPTS = 6
const ANSWER_LENGTH = 5

let wordOfTheDay = ""
let currentGuess = ""

let letterCounter = 0
let attemptCounter = 0

let isGameFinished = false
let isInvalidGuessReset = false

init()

async function init() {
    wordOfTheDay = "ivory"
}

document.addEventListener("keydown", async function (event) {
    if (isGameFinished) {
        event.preventDefault()
        return
    }

    const keyPressed = event.key
    const isLineFull =
        letterCounter - attemptCounter * ANSWER_LENGTH === ANSWER_LENGTH
    if (isLetterKey(keyPressed)) {
        if (isLineFull) {
            event.preventDefault()
            return
        }

        handleLetterKeys(keyPressed)
        return
    }

    const isLineEmpty = letterCounter > 0
    if (keyPressed == BACKSPACE_KEY && isLineEmpty) {
        handleBackspaceKey()
        return
    }

    if (keyPressed == ENTER_KEY && isLineFull) {
        await handleEnterKey()
        return
    }
})

function handleGameWon() {
    alert("You have won")
    addClassToCurrentLetterBoxes("correct-spot")
    var title = document.querySelector(".title")
    title.classList.add("rainbow-boi")
    isGameFinished = true
}

function addClassToCurrentLetterBoxes(className) {
    for (
        i = attemptCounter * ANSWER_LENGTH;
        i < attemptCounter * ANSWER_LENGTH + ANSWER_LENGTH;
        i++
    ) {
        var letterBox = document.querySelector(`#letter${i}`)
        letterBox.classList.add(className)
    }
}

function removeClassFromCurrentLetterBoxes(className) {
    for (
        i = attemptCounter * ANSWER_LENGTH;
        i < attemptCounter * ANSWER_LENGTH + ANSWER_LENGTH;
        i++
    ) {
        var letterBox = document.querySelector(`#letter${i}`)
        letterBox.classList.remove(className)
    }
}

function colorInvalidGuess() {
    addClassToCurrentLetterBoxes("invalid-guess")
    isInvalidGuessReset = true
}

function colorValidGuessLetters(word) {
    let wordOfTheDayMap = makeMap(wordOfTheDay)
    for (i = 0; i < wordOfTheDay.length; i++) {
        var letterBox = document.querySelector(
            `#letter${i + attemptCounter * ANSWER_LENGTH}`
        )
        if (wordOfTheDay[i] === word[i]) {
            letterBox.classList.add("correct-spot")
            wordOfTheDayMap[wordOfTheDay[i]]--
        }
    }

    for (i = 0; i < wordOfTheDay.length; i++) {
        var letterBox = document.querySelector(
            `#letter${i + attemptCounter * ANSWER_LENGTH}`
        )
        if (wordOfTheDay[i] === word[i]) {
            continue
        }
        if (
            wordOfTheDay.includes(word[i]) &&
            wordOfTheDayMap[wordOfTheDay[i]] > 0
        ) {
            letterBox.classList.add("incorrect-spot")
            continue
        }

        letterBox.classList.add("not-present")
    }
}

function makeMap(word) {
    let map = new Map()
    for (i = 0; i < word.length; i++) {
        if (!map.has(word[i])) {
            map.set(word[i], 1)
            continue
        }

        map[word[i]]++
    }

    return map
}

function handleLetterKeys(keyPressed) {
    const currentLetter = document.querySelector(`#letter${letterCounter}`)
    currentLetter.innerHTML = keyPressed.toUpperCase()
    currentGuess = currentGuess.concat(keyPressed.toLowerCase())
    letterCounter++
}

function handleBackspaceKey() {
    if (isInvalidGuessReset) {
        removeClassFromCurrentLetterBoxes("invalid-guess")
        isInvalidGuessReset = false
    }
    letterCounter--
    const currentLetter = document.querySelector(`#letter${letterCounter}`)
    currentLetter.innerHTML = null
    currentGuess = currentGuess.substring(0, currentGuess.length - 1)
}

async function handleEnterKey() {
    if (currentGuess == wordOfTheDay) {
        handleGameWon()
        return
    }

    const isValidGuess = await validateWord(currentGuess)
    if (isValidGuess) {
        colorValidGuessLetters(currentGuess)
        if (attemptCounter == MAX_ATTEMPTS - 1) {
            alert("You have lost")
            isGameFinished = true
            return
        }

        attemptCounter++
        currentGuess = ""
        return
    }

    colorInvalidGuess()
}

async function validateWord(word) {
    const fetchedJson = await fetch(VALIDATE_WORD_URL, {
        method: "POST",
        body: JSON.stringify({
            word: word,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
    const processedResponse = await fetchedJson.json()
    return processedResponse.validWord
}

async function getWordOfTheDay() {
    const fetchedJson = await fetch(WORD_OF_THE_DAY_URL)
    const processedResponse = await fetchedJson.json()

    return processedResponse.word
}

function isLetterKey(letter) {
    return /^[a-zA-Z]$/.test(letter)
}
