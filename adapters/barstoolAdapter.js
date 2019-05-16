const axios = require('axios')

const logger = require('../config/logging')

const getAllGames = async (league) => {
  let response

  const gameIdMap = {
    NBA: '6c974274-4bfc-4af8-a9c4-8b926637ba74',
    MLB: 'eed38457-db28-4658-ae4f-4d4d38e9e212',
  }

  if (!gameIdMap[league]) {
    const error = { status: 400, response: 'Invalid league' }
    const logMessage = `[barstoolAdapter - getAllGames(${league}) - ${error.status} - ${error.data}]`
    logger.log('error', logMessage)
    throw error
  }


  const gameId = gameIdMap[league]
  const url = `https://chumley.barstoolsports.com/dev/data/games/${gameId}.json`
  const request = {
    method: 'GET',
    url,
  }

  try {
    response = await axios.request(request)
  } catch (error) {
    const logMessage = `[barstoolAdapter - getAllGames(${league}) - ${error.response.status} - ${error.response.data}]`
    logger.log('error', logMessage)
    throw error
  }

  return response.data
}

module.exports = {
  getAllGames,
}
