(function () {

    let localStorageKey = "ICHITURN_LOCALSTORAGE_ORDERS_V2.1"

    window.addEventListener("load", function () {
        // collect from browser storage
        let savedCards = getCardsFromStorage()

        // display to collection
        for (index in savedCards) {
            let card = savedCards[index]
            appendNewCardElement(card)
        }
    })

    document.getElementById("submit-card-codes").addEventListener("click", function () {
        if (validateEmailAddressValue()) {
            hideNotification()
            shouldStartLoading(true)
            submit()
        } else {
            showNotification("error", "Invalid email address")
        }
    })

    document.getElementById("clear-notification").addEventListener("click", function () {
        hideNotification()
    })

    document.getElementById("add-card").addEventListener("click", addCardHandler)

    document.getElementById('card-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCardHandler()
        }
    });

    // HELPERS

    function addCardHandler() {
        let cardKeyword = document.getElementById("card-input").value

        if (cardKeyword.length > 0) {
            shouldEnableAddButton(false)
            addNewCard(cardKeyword)
        }
    }

    function checkDuplicates(newCard) {
        let savedCards = getCardsFromStorage()

        let duplicate = savedCards.filter(card => (card.passcode == newCard.passcode))

        if (duplicate.length > 0) {
            return true
        }

        return false
    }

    function clearCards() {
        localStorage.setItem(localStorageKey, "[]")
    }

    function clearUI() {
        document.querySelector(".collection").innerHTML = ""
        document.getElementById("email-address-input").value = ""
    }

    function submit() {

        const parameters = {
            cards: getCardsFromStorage(),
            emailAddress: document.getElementById("email-address-input").value
        };

        (async () => {
            const rawResponse = await fetch('/api/send-codes', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(parameters)
            });

            const response = await rawResponse.json();

            if (response) {
                if (response.status == "ok") {
                    showNotification("success", "Request submitted. A quote will be sent to your email shortly.")
                    console.log(response)
                    clearCards()
                    clearUI()
                }

                shouldStartLoading(false)
            }
        })()

    }

    function validateEmailAddressValue() {
        let emailAddress = document.getElementById("email-address-input").value

        if (emailAddress.length == 0) return false

        let regex = emailAddress.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)

        if (regex != null && regex.length) return true

        return false
    }

    function addNewCard(cardKeyword) {
        let savedCards = getCardsFromStorage()

        if (savedCards.length == 0 || savedCards.indexOf(cardKeyword) == -1) {

            const parameters = {
                card: cardKeyword
            };

            (async () => {
                const rawResponse = await fetch('/api/add-card', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(parameters)
                });

                const response = await rawResponse.json();

                if (response) {
                    if (response.status == "ok") {
                        if (response.hasOwnProperty("card")) {

                            let card = response.card

                            if (!checkDuplicates(card)) {
                                savedCards.push(card)
                                localStorage.setItem(localStorageKey, JSON.stringify(savedCards))
                                appendNewCardElement(card)
                                scrollCardsToBottom()
                                hideNotification()
                                clearInput()
                            } else {
                                showNotification("error", `${card.name} is already in the list`)
                            }
                        }

                    } else {
                        showNotification("error", response.error)
                    }
                    shouldEnableAddButton(true)
                }
            })()
        } else {
            showNotification("error", "Card code is already in the list")
            shouldEnableAddButton(true)
        }
    }

    function clearInput() {
        document.getElementById("card-input").value = ""
    }

    function scrollCardsToBottom() {
        let parentElementCollection = document.querySelector(".collection")
        parentElementCollection.scrollTo(0, parentElementCollection.scrollHeight);
    }

    function removeCardCodeWithPasscode(passcode) {
        let savedCards = getCardsFromStorage()

        savedCards = savedCards.filter(card => card.passcode != passcode)

        localStorage.setItem(localStorageKey, JSON.stringify(savedCards))
    }

    function hideNotification() {
        let notificationContainer = document.getElementById("notification")
        notificationContainer.classList.add("hidden")
    }

    function showNotification(type, message) {
        let notificationContainer = document.getElementById("notification")

        let notificationText = document.getElementById("notification-text")

        let color = type == "error" ? "red" : "teal"

        notificationText.innerText = message

        notificationContainer.classList.add(color)
        notificationContainer.classList.remove("hidden")
    }

    function appendNewCardElement(card) {
        let listItem = document.createElement("li")
        listItem.id = `list-${card.passcode}`
        listItem.classList.add("collection-item", "row")

        let divCardPasscode = document.createElement("div")
        divCardPasscode.classList.add("card-passcode", "col", "s3")
        divCardPasscode.innerText = card.passcode
        listItem.appendChild(divCardPasscode)

        let divCardName = document.createElement("div")
        divCardName.classList.add("card-name", "col", "s7")
        divCardName.innerText = card.name
        listItem.appendChild(divCardName)

        let divInputField = document.createElement("div")
        divInputField.classList.add("input-field", "col", "s2", "flexy")
        listItem.appendChild(divInputField)

        let divSpacer = document.createElement("div")
        divSpacer.classList.add("spacer")
        divInputField.appendChild(divSpacer)

        let button = document.createElement("a")
        button.classList.add("card-remove", "waves-effect", "waves-light", "btn", "red")
        button.id = `button-${card.passcode}`

        let icon = document.createElement("i")
        icon.classList.add("material-icons")
        icon.innerText = "delete"

        button.appendChild(icon)

        button.addEventListener("click", function () {
            let parentElementCollection = document.querySelector(".collection")
            const passcode = this.id.replace("button-", "").toUpperCase()
            removeCardCodeWithPasscode(passcode)
            parentElementCollection.removeChild(listItem)
        })

        divInputField.appendChild(button)

        let parentElementCollection = document.querySelector(".collection")
        parentElementCollection.appendChild(listItem)
    }

    function getCardsFromStorage() {
        let savedOrdersString = localStorage.getItem(localStorageKey)

        let value = JSON.parse(savedOrdersString)

        return value == null ? [] : value
    }

    function shouldEnableButtons(enable) {
        const buttons = document.querySelectorAll("a");
        buttons.forEach((button) => {
            if (enable) {
                button.classList.remove("disabled")
            } else {
                button.classList.add("disabled")
            }
        });
    }

    function shouldEnableAddButton(enable) {
        let addButton = document.getElementById("add-card")
        if (enable) {
            addButton.classList.remove("disabled")
        } else {
            addButton.classList.add("disabled")
        }
    }

    function shouldDisplayPreloader(show) {
        if (show) {
            document.getElementById("pre-loader").classList.add("hidden")
        } else {
            document.getElementById("pre-loader").classList.remove("hidden")
        }
    }

    function shouldStartLoading(bool) {
        shouldDisplayPreloader(!bool)
        shouldEnableButtons(!bool)
    }

})();