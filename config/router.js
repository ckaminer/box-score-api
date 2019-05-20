const express = require('express')
const gameController = require('../controllers/gameController')

const router = express.Router()

router.get('/games', gameController.allData)

router.post('/games', gameController.createGame)

module.exports = router
