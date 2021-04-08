const express = require("express")
const path = require("path")
const axios = require('axios')

const app = express()

app.use("/public", express.static("public"))
app.use(express.json())

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/api/add-card", (req, res) => {
    const body = req.body

    if (body.hasOwnProperty("card")) {

        let card = body.card
        let propertyName = (card.length == 8 && /[0-9]/.test(card)) ? 'id' : 'name'

        axios({
            method: "get",
            url: `https://db.ygoprodeck.com/api/v7/cardinfo.php?${propertyName}=${card}`,
        }).then(function (response) {

            let data = response.data.data[0]
            let id = data.id
            let name = data.name

            res.status(200).send({
                status: "ok",
                card: {
                    passcode: id,
                    name: name
                }
            })

        }).catch(function (error) {
            let errorMessage = error.response.data.error
            errorMessage = errorMessage.split(". ")

            res.status(200).send({
                status: "error",
                error: `${errorMessage[0]}.`
            })
        })

    } else {
        res.status(400).send("Invalid Request")
    }
})

app.post("/api/send-codes", (req, res) => {
    const body = req.body

    if (body.hasOwnProperty("cards")) {

        let passcodes = []

        let email = body.emailAddress
        let cards = body.cards

        for (index in cards) {
            passcodes.push(cards[index].passcode)
        }

        fetchSets(passcodes)

    } else {
        res.status(400).send("Invalid Request")
    }

    async function fetchSets(sets) {
        let cardCodes = []
        let setCounter = 0

        for (setIndex in sets) {
            let passcode = sets[setIndex]
            await fetchSet(passcode, "")
        }

        function fetchSet(passcode, rdcontinue = "") {
            axios({
                method: "get",
                url: `https://yugioh.fandom.com/api.php?action=query&prop=redirects&redirects&continue&format=json&titles=${passcode}&rdcontinue=${rdcontinue}`,
            }).then(function (response) {
                let pages = response.data.query.pages
                let continueRedirect

                if (response.data.hasOwnProperty("continue")) {
                    if (response.data.continue.hasOwnProperty("rdcontinue")) {
                        continueRedirect = response.data.continue.rdcontinue
                    }
                }

                for (var page in pages) {
                    let redirects = pages[page].redirects
                    for (var index in redirects) {
                        let setTitle = redirects[index].title
                        if (codeIsFromOcgSet(setTitle)) {
                            cardCodes.push(setTitle)
                        }
                    }
                }

                if (continueRedirect != undefined) {
                    fetchSet(passcode, continueRedirect)
                } else {

                    setCounter++
                    if (setCounter == sets.length) {
                        res.status(200).send({
                            status: "ok",
                            cardCodes: cardCodes,
                            emailAddress: email
                        })
                    }
                }
            })
        }
    }
})

function codeIsFromOcgSet(cardCode) {
    if (/[A-Z0-9]+-JP[0-1]+/.test(cardCode) ||
        /[A-Z0-9]+-JA[0-1]+/.test(cardCode) ||
        /[A-Z0-9]+-AE[0-1]+/.test(cardCode) ||
        /[A-Z0-9]+-[0-1]+/.test(cardCode)) {
        return true
    }

    return false
}

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`))