const backspaceKey = "Backspace"
const enterKey = "Enter"

const wordOfTheDayLink = "https://words.dev-apis.com/word-of-the-day"
const validateWordLink = "https://words.dev-apis.com/validate-word"

const maxAttempts = 6
const answerLength = 5

let wordOfTheDay = ""
let currentGuess = ""

let letterCounter = 0
let attemptCounter = 0

let isGameFinished = false
let isInvalidGuessReset = false

init()

async function init() {
    wordOfTheDay = await getWordOfTheDay()
}

document.addEventListener("keydown", async function (event) {
    if (isGameFinished) {
        event.preventDefault()
        return
    }

    const keyPressed = event.key
    if (isLetter(keyPressed)) {
        if (letterCounter - attemptCounter * answerLength === 5) {
            event.preventDefault()
            return
        }

        handleLetterKeys(keyPressed)
        return
    }

    if (keyPressed == backspaceKey && letterCounter > 0) {
        handleBackspaceKey()
        return
    }

    if (keyPressed == enterKey && letterCounter % answerLength == 0) {
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
        i = attemptCounter * answerLength;
        i < attemptCounter * answerLength + answerLength;
        i++
    ) {
        var letterBox = document.querySelector(`#letter${i}`)
        letterBox.classList.add(className)
    }
}

function removeClassFromCurrentLetterBoxes(className) {
    for (
        i = attemptCounter * answerLength;
        i < attemptCounter * answerLength + answerLength;
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
    for (i = 0; i < wordOfTheDay.length; i++) {
        var letterBox = document.querySelector(
            `#letter${i + attemptCounter * answerLength}`
        )
        if (wordOfTheDay.includes(word[i])) {
            if (wordOfTheDay[i] === word[i]) {
                letterBox.classList.add("correct-spot")
                continue
            }

            letterBox.classList.add("incorrect-spot")
            continue
        }

        letterBox.classList.add("not-present")
    }
}

function handleLetterKeys(keyPressed) {
    const currentLetter = document.querySelector(`#letter${letterCounter}`)
    currentLetter.innerHTML = keyPressed.toUpperCase()
    currentGuess = currentGuess.concat(keyPressed)
    letterCounter++
}

function handleBackspaceKey() {
    if (isInvalidGuessReset) {
        removeClassFromCurrentLetterBoxes("invalid-guess")
        isInvalidGuessReset = false
    }
    const currentLetter = document.querySelector(`#letter${letterCounter - 1}`)
    currentLetter.innerHTML = null
    currentGuess = currentGuess.substring(0, currentGuess.length - 1)
    letterCounter--
}

async function handleEnterKey() {
    if (currentGuess == wordOfTheDay) {
        handleGameWon()
        return
    }

    const isValidGuess = await validateWord(currentGuess)
    if (isValidGuess) {
        colorValidGuessLetters(currentGuess)
        if (attemptCounter == maxAttempts - 1) {
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
    const fetchedJson = await fetch(validateWordLink, {
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
    const fetchedJson = await fetch(wordOfTheDayLink)
    const processedResponse = await fetchedJson.json()

    return processedResponse.word
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}
