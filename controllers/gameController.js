const barstoolAdapter = require('../adapters/barstoolAdapter')

const allData = async (req, res) => {
  const { league } = req.query
  if (!league) {
    res.status(400).send({ message: 'Missing league' })
    return
  }

  let game = {}
  try {
    game = await barstoolAdapter.getAllGames(league.toUpperCase())
  } catch (error) {
    res.status(error.status).send({ message: 'Unable to retrieve game data' })
    return
  }

  res.status(200).send([game])
}

module.exports = {
  allData,
}
