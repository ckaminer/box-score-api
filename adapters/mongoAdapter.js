const mongoClient = require('mongodb').MongoClient
const objectId = require('mongodb').ObjectID

const logger = require('../config/logging')

const connect = async () => {
  try {
    const client = await mongoClient.connect('mongodb://127.0.0.1:27017/BOX_SCORE')
    logger.info('[MONGO - CONNECT] - Successfully connected to Mongo')
    return client
  } catch (err) {
    logger.error(`[MONGO - CONNECT] - Failed to connect to Mongo: ${err}`)
    throw err
  }
}

const saveGame = async (game) => (
  new Promise((resolve, reject) => {
    connect().then(async (conn) => {
      const db = conn.db('BOX_SCORE')
      try {
        const result = await db.collection('games').insertOne(game)
        conn.close()
        resolve(result.ops[0])
      } catch (err) {
        logger.error(`[MONGO - SAVEGAME] - Error saving game: ${err}`)
        reject(err)
      }
    }).catch((err) => {
      reject(err)
    })
  })
)

const findGames = async (query = {}) => (
  new Promise((resolve, reject) => {
    connect().then((conn) => {
      const db = conn.db('BOX_SCORE')
      const cursor = db.collection('games').find(query).sort({ _id: -1 })
      const games = cursor.toArray()
      resolve(games)
    }).catch((err) => {
      reject(err)
    })
  })
)

const findAllGames = async () => {
  const games = await findGames()
  return games
}

const findAllGamesByLeague = async (league) => {
  const games = await findGames({ league })
  return games
}

const findSingleGame = async (eventInformation) => {
  const games = await findGames(eventInformation)
  return games[0]
}

const deleteGameById = (id) => (
  new Promise((resolve, reject) => {
    connect().then(async (conn) => {
      const db = conn.db('BOX_SCORE')
      try {
        const result = await db.collection('games').deleteOne({ _id: objectId(id) })
        conn.close()
        if (result.deletedCount === 1) {
          resolve()
        } else {
          logger.error(`[MONGO - DELETEGAMEBYID] - Failed to delete game for given id: ${id}`)
          reject(new Error(`Failed to delete game for given id: ${id}`))
        }
      } catch (err) {
        logger.error(`[MONGO - DELETEGAMEBYID] - Error deleting game: ${err}`)
        reject(err)
      }
    }).catch((err) => {
      reject(err)
    })
  })
)

module.exports = {
  connect,
  saveGame,
  findGames,
  findAllGames,
  findAllGamesByLeague,
  findSingleGame,
  deleteGameById,
}
