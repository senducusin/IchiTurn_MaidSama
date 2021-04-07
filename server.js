const express = require("express")
const path = require("path")
const axios = require('axios')

const app = express()

app.use("/public",express.static("public"))
app.use(express.json())

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.get("/", (req,res)=>{
    res.render("index")
})

app.post("/api/send-codes",(req,res)=>{
    const body = req.body

    if(body.hasOwnProperty("cardCodes") === true){
        res.status(200).send({status:"ok"})
        // Logs
        console.log(body) 

        // send axios request here
    }else{
        res.status(400).send("Invalid Request")
    }
})

// 50371210

let cardCodes = []

fetchSet(46986414, "")
// console.log(cardCodes)

function fetchSet(passcode, rdcontinue = ""){
    axios({
        method: "get",
        url: `https://yugioh.fandom.com/api.php?action=query&prop=redirects&redirects&continue&format=json&titles=${passcode}&rdcontinue=${rdcontinue}`,
    }).then(function (response){
        let pages = response.data.query.pages
        let continueRedirect
        // = response.data.continue.rdcontinue
        if (response.data.hasOwnProperty("continue")){
            if(response.data.continue.hasOwnProperty("rdcontinue")){
                continueRedirect = response.data.continue.rdcontinue
            }
        }

        for (var page in pages){
            let redirects = pages[page].redirects
            for (var index in redirects){
                let setTitle = redirects[index].title
                if( /[A-Z0-9]+-JP[0-1]+/.test(setTitle) || 
                    /[A-Z0-9]+-JA[0-1]+/.test(setTitle) || 
                    /[A-Z0-9]+-AE[0-1]+/.test(setTitle) || 
                    /[A-Z0-9]+-[0-1]+/.test(setTitle)){
                        cardCodes.push(setTitle)
                }
            }
        }
        
        // console.log(continueRedirect)
        if (continueRedirect != undefined) {
            fetchSet(passcode, continueRedirect)
        }else {
            console.log(cardCodes)
        }
    })
}



const port = process.env.PORT || 3000
app.listen(port, ()=> console.log(`Listening on port ${port}...`))