const express = require("express")
const path = require("path")
const axios = require('axios')

const app = express()

app.use("/public",express.static("public"))

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.get("/", (ret,res)=>{
    let properties = {
        orders: [
            "LIOV-JP001",
            "LIOV-JP002",
            "LIOV-JP003",
            "LIOV-JP004"
        ]
    }
    res.render("index",properties)
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})