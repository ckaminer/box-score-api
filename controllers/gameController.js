const gameService = require('../services/gameService')
const mongoAdapter = require('../adapters/mongoAdapter')

const allData = async (req, res) => {
  let { league } = req.query
  if (!league) league = 'ALL'

  let games
  try {
    games = await gameService.getGamesList(league.toUpperCase())
  } catch (error) {
    const status = error.status ? error.status : 500
    res.status(status).send({ message: 'Unable to retrieve game data' })
    return
  }

  res.status(200).send(games)
}

const createGame = async (req, res) => {
  const game = req.body

  let createdGame
  try {
    createdGame = await mongoAdapter.saveGame(game)
  } catch (err) {
    res.status(500).send('blamo')
    return
  }

  console.log('CREATED GAME::::', createdGame)
  res.status(200).send(createdGame)
}

const findCollection = async (req, res) => {
  let gameCollection
  try {
    gameCollection = await mongoAdapter.findGames()
  } catch (err) {
    res.status(500).send('blamo')
    return
  }

  console.log('FOUND COLLECION:::: ', gameCollection)
  res.status(200).send(gameCollection)
}

module.exports = {
  allData,
  createGame,
  findCollection,
}
