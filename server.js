const express = require("express")
const path = require("path")
const axios = require('axios')

const app = express()
// app.use(express.static(__dirname,"public"))
app.use("/public",express.static("public"))

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.get("/", (ret,res)=>{
    res.render("index")
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})