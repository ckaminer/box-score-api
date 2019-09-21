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

const upsertGame = async (game) => (
  new Promise((resolve, reject) => {
    connect().then(async (conn) => {
      const db = conn.db('BOX_SCORE')
      try {
        const result = await db.collection('games').update(
          game.src_id,
          { _id: objectId(), ...game },
          { upsert: true },
        )
        conn.close()
        if (result.nUpserted + result.nModified === 1) {
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

module.exports = {
  connect,
  upsertGame,
  findGames,
  findSingleGame,
}
