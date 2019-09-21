const express = require('express')
const gameController = require('../controllers/gameController')

const router = express.Router()

router.get('/games', gameController.gamesListController)
router.get('/games/:gameId', gameController.singleGameController)

module.exports = router
