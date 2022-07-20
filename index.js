const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json());

app.use('/games', express.static(__dirname + '/'))

app.get("/", (req, res) => {
    const games = require('./games.json')
    res.status(200).json(games.filter(game => !game.dev))
})

app.get("/latest", (req, res) => {
    const games = require('./games.json')
    res.status(200).json(games.slice(-6))
})

const PORT = 5000

app.listen(PORT, () => {
    console.log("App listening on port " + PORT);
})