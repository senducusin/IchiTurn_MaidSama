(function () {
    
    let localStorageKey = "ICHITURN_LOCALSTORAGE_ORDERS"
    let parentElementCollection = document.querySelector(".collection")
 

    window.addEventListener("load", function(){
        // collect from browser storage
        let savedCardCodes = getCardCodes()

        // display to collection
        for (index in savedCardCodes) {
            let cardCode = savedCardCodes[index]
            appendNewCardCode(cardCode)
        }
    })

    document.getElementById("submit-card-codes").addEventListener("click", function(){
        const params = {
            cardCodes: getCardCodes(),
        };

        (async () => {
            const rawResponse = await fetch('/api/send-codes', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
            });
            const content = await rawResponse.json();
        })();
    })

    document.getElementById("clear-notification").addEventListener("click",function(){
        hideNotification()
    })

    document.getElementById("add-card-code").addEventListener("click",function(){
        let cardCode = document.getElementById("card-code-input").value.toUpperCase()

        if (validateCardCodeValue(cardCode)) {
            addNewCardCode(cardCode)
        }else{
            showNotification("error", "Invalid card code format. Valid format must be 10 characters in length, must contain '-', and from OCG set")
        }
        
    })

    // HELPERS
    function validateCardCodeValue(cardCode){

        if (cardCode.length != 10) return false

        if (cardCode.indexOf("-") != 4) return false

        if (cardCode.indexOf("JP") != 5) return false

        return true
    }

    function addNewCardCode(cardCode){
        let savedCardCodes = getCardCodes()

        if (savedCardCodes.indexOf(cardCode) == -1) {
            savedCardCodes.push(cardCode)
            localStorage.setItem(localStorageKey, JSON.stringify(savedCardCodes))
            appendNewCardCode(cardCode)
            hideNotification()
        }else{
            showNotification("error", "Card code is already in the list")
        }
    }

    function removeCardCode(cardCodeToRemove){
        let savedCardCodes = getCardCodes()
        
        savedCardCodes = savedCardCodes.filter(cardCode => cardCode != cardCodeToRemove)
        localStorage.setItem(localStorageKey, JSON.stringify(savedCardCodes))
    }

    function hideNotification(){
        let notificationContainer = document.getElementById("notification")
        notificationContainer.classList.add("hidden")
    }

    function showNotification(type, message){
        let notificationContainer = document.getElementById("notification")

        let notificationText = document.getElementById("notification-text")
        
        let color = type == "error" ? "red" : "teal"

        // notificationContainer.innerText = message
        notificationText.innerText = message
        
        notificationContainer.classList.add(color, "white-text")
        notificationContainer.classList.remove("hidden")
    }

    function appendNewCardCode(cardCode){
        let cardCodeLowerCased = cardCode.toLowerCase()

        let listItem = document.createElement("li")
        listItem.id = `list-${cardCodeLowerCased}`
        listItem.classList.add("collection-item","row")

        let divCardCode = document.createElement("div")
        divCardCode.classList.add("card-code", "col", "s9")
        divCardCode.innerText = cardCode
        listItem.appendChild(divCardCode)

        let divInputField = document.createElement("div")
        divInputField.classList.add("input-field","col","s3", "flexy")
        listItem.appendChild(divInputField)

        let divSpacer = document.createElement("div")
        divSpacer.classList.add("spacer")
        divInputField.appendChild(divSpacer)

        let button = document.createElement("a")
        button.classList.add("waves-effect", "waves-light", "btn", "red")
        button.id = `button-${cardCodeLowerCased}`
        button.innerText = "Remove"

        button.addEventListener("click",function(){
            const cardCode = this.id.replace("button-","").toUpperCase()
            removeCardCode(cardCode)
            parentElementCollection.removeChild(listItem)
        })

        divInputField.appendChild(button)

        parentElementCollection.appendChild(listItem)
    }

    function getCardCodes(){
        let savedOrdersString = localStorage.getItem(localStorageKey)
        return savedCardCodes = JSON.parse(savedOrdersString)
    }

})();