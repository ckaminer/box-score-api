const mongoClient = require('mongodb').MongoClient

const logger = require('../config/logging')

const connect = async () => {
  try {
    // local address used for development, else use mongo image from docker
    const mongoAddress = process.env.LOCAL ? '127.0.0.1' : 'mongo'
    const client = await mongoClient.connect(`mongodb://${mongoAddress}:27017/BOX_SCORE`, { useNewUrlParser: true })
    return client
  } catch (err) {
    logger.error(`[MONGO - CONNECT] - Failed to connect to Mongo: ${err}`)
    throw err
  }
}

const upsertGame = async (game) => (
  new Promise((resolve, reject) => {
    connect().then(async (conn) => {
      const db = conn.db('BOX_SCORE')
      try {
        const result = await db.collection('games').updateOne(
          { src_id: game.src_id },
          { $set: { updated_at: Date.now(), ...game } },
          { upsert: true },
        )
        conn.close()
        if (result.result.n === 1) {
          resolve()
        } else {
          logger.error(`[MONGO - UPSERTGAME] - Failed to upsert game for given id: ${game.src_id}`)
          reject(new Error(`Failed to upsert game for given id: ${game.src_id}`))
        }
      } catch (err) {
        logger.error(`[MONGO - UPSERTGAME] - Error upserting game: ${err}`)
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
      conn.close()
      resolve(games)
    }).catch((err) => {
      reject(err)
    })
  })
)

const findSingleGame = async (eventInformation) => {
  const games = await findGames(eventInformation)
  return games[0]
}

const clearGamesCollection = async () => (
  new Promise((resolve, reject) => {
    connect().then((conn) => {
      const db = conn.db('BOX_SCORE')
      db.collection('games').deleteMany()
      logger.info('[MONGO - clearGamesCollection] - Successfully cleared Mongo cache')
      conn.close()
      resolve()
    }).catch((err) => {
      logger.error(`[MONGO - clearGamesCollection] - Error clearing cache: ${err}`)
      reject(err)
    })
  })
)

module.exports = {
  connect,
  upsertGame,
  findGames,
  findSingleGame,
  clearGamesCollection,
}
