const gameService = require('../services/gameService')

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

module.exports = {
  allData,
}
