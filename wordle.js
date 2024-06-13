const backspaceKey = "Backspace"
const enterKey = "Enter"

const wordOfTheDayLink = "https://words.dev-apis.com/word-of-the-day"
const validateWordLink = "https://words.dev-apis.com/validate-word"

const maxAttempts = 5

let wordOfTheDay = ""
let letterCounter = 0
let attemptCounter = 0
let currentGuess = ""
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
        if (letterCounter - 1 - attemptCounter * 5 >= 4) {
            event.preventDefault()
            return
        }

        handleLetters(keyPressed)
        return
    }

    if (keyPressed == backspaceKey && letterCounter > 0) {
        handleBackSpace()
    }

    if (keyPressed == enterKey && letterCounter % 5 == 0) {
        if (currentGuess == wordOfTheDay) {
            handleGameWon()
            return
        }

        const isValidGuess = await validateWord(currentGuess)
        if (isValidGuess) {
            colorValidGuessLetters()
            if (attemptCounter == maxAttempts) {
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
})

function handleGameWon() {
    alert("You have won")
    addClassToCurrentLetterBoxes("correct-spot")
    var title = document.querySelector(".title")
    title.classList.add("rainbow-boi")
    isGameFinished = true
}

function addClassToCurrentLetterBoxes(className) {
    for (i = attemptCounter * 5; i < attemptCounter * 5 + 5; i++) {
        var letterBox = document.querySelector(`#letter${i}`)
        letterBox.classList.add(className)
    }
}

function removeClassToCurrentLetterBoxes(className) {
    for (i = attemptCounter * 5; i < attemptCounter * 5 + 5; i++) {
        var letterBox = document.querySelector(`#letter${i}`)
        letterBox.classList.add(className)
    }
}

function colorInvalidGuess() {
    addClassToCurrentLetterBoxes("invalid-guess")
    isInvalidGuessReset = true
}

function colorValidGuessLetters() {
    for (i = 0; i < wordOfTheDay.length; i++) {
        var letterBox = document.querySelector(
            `#letter${i + attemptCounter * 5}`
        )
        if (wordOfTheDay.includes(currentGuess[i])) {
            if (wordOfTheDay[i] === currentGuess[i]) {
                letterBox.classList.add("correct-spot")
                continue
            }

            letterBox.classList.add("incorrect-spot")
            continue
        }

        letterBox.classList.add("not-present")
    }
}

function handleLetters(keyPressed) {
    const currentLetter = document.querySelector(`#letter${letterCounter}`)
    currentLetter.innerHTML = keyPressed.toUpperCase()
    currentGuess = currentGuess.concat(keyPressed)
    letterCounter++
}

function handleBackSpace() {
    if (isInvalidGuessReset) {
        fremoveClassToCurrentLetterBoxes("invalid-guess")
        isInvalidGuessReset = false
    }
    const currentLetter = document.querySelector(`#letter${letterCounter - 1}`)
    currentLetter.innerHTML = null
    currentGuess = currentGuess.substring(0, currentGuess.length - 1)
    letterCounter--
}

async function validateWord(word) {
    const fetchedJson = await fetch(validateWordLink, {
        method: "POST",
        body: JSON.stringify({
            word: currentGuess,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    })
    const processedResponse = await fetchedJson.json()
    return processedResponse.validWord
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}

async function getWordOfTheDay() {
    const fetchedJson = await fetch(wordOfTheDayLink)
    const processedResponse = await fetchedJson.json()

    return processedResponse.word
}
