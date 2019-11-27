const express = require('express')
const morgan = require('morgan')

const logger = require('./logging')
const router = require('./router')
const mongoAdapter = require('../adapters/mongoAdapter')

const app = express()
let server

const mongoConn = mongoAdapter.connect().then(() => {
  process.on('exit', mongoAdapter.closeConnection)
  // handle kill commands, such as CTRL+C:
  process.on('SIGINT', mongoAdapter.closeConnection)
  process.on('SIGTERM', mongoAdapter.closeConnection)
  // prevent dirty exit on code-fault crashes:
  process.on('uncaughtException', mongoAdapter.closeConnection)

  mongoAdapter.clearGamesCollection()

  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  app.use((req, res, next) => {
    const validHeader = !req.headers.origin || req.headers.origin === 'http://localhost:8080'
    res.header('Access-Control-Allow-Origin', validHeader ? req.headers.origin : 'no')
    res.header('Access-Control-Allow-Methods', 'GET')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization')

    next()
  })

  server = app.listen(8081, () => {
    logger.log('info', '[EXPRESS] - listening on port: 8081')
  })

  app.use('/api/v1', router)
}).catch(() => {
  logger.log('error', '[server - failed to connect to mongo cache, shutting down...]')
})

module.exports = {
  app, server, mongoConn,
}
