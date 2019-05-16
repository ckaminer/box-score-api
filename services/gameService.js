const barstoolAdapter = require('../adapters/barstoolAdapter')

const getGamesList = async (league) => {
  let allGames = []
  const leagues = league.toUpperCase() === 'ALL' ? ['NBA', 'MLB'] : [league]

  const leaguePromises = leagues.map(l => (
    new Promise(async (resolve, reject) => {
      try {
        const games = await barstoolAdapter.getAllGames(l)
        allGames = allGames.concat(games)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  ))

  try {
    await Promise.all(leaguePromises)
  } catch (err) {
    throw err
  }

  return allGames
}

module.exports = {
  getGamesList,
}
