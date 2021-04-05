const express = require("express")
const path = require("path")
// const axios = require('axios')

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

const port = process.env.PORT || 3000
app.listen(port, ()=> console.log(`Listening on port ${port}...`))