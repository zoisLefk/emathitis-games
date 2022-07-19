const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json());

app.use('/games', express.static(__dirname + '/'))

app.get("/allgames", (req, res) => {
    const games = require('./games.json')
    res.status(200).json(games)
})

app.get("/latest", (req, res) => {
    const games = require('./games.json')
    res.status(200).json(games.slice(-6))
})

app.get("/", (req, res) => {
    res.json({ message: 'hello world' })
})

const PORT = 5000

app.listen(PORT, () => {
    console.log("App listening on port " + PORT);
})