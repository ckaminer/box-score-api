const mongoClient = require('mongodb').MongoClient

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
    connect().then((conn) => {
      const db = conn.db('BOX_SCORE')
      db.collection('games').insertOne(game, (err, res) => {
        if (err) {
          logger.error(`[MONGO - SAVEGAME] - Error saving game: ${err}`)
          reject(err)
        }
        conn.close()
        resolve(res.ops[0])
      })
    }).catch((err) => {
      reject(err)
    })
  })
)

const findGames = async () => (
  new Promise((resolve, reject) => {
    connect().then((conn) => {
      const db = conn.db('BOX_SCORE')
      const cursor = db.collection('games').find().sort({ league: 1 })
      const games = cursor.toArray()
      resolve(games)
    }).catch((err) => {
      reject(err)
    })
  })
)

module.exports = {
  saveGame,
  findGames,
}
