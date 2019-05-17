const express = require('express')
const morgan = require('morgan')
const mongoClient = require('mongodb').MongoClient

const logger = require('./logging')
const router = require('./router')


mongoClient.connect('mongodb://127.0.0.1:27017/BOX_SCORE', (err, database) => {
  if (err) {
    console.log('ERROR:::: ', err)
  } else {
    console.log('DATABASE::: ', database)
  }
})
const app = express()

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

const server = app.listen(8081, () => {
  logger.log('info', '[EXPRESS] - listening on port: 8081')
})

app.use('/api/v1', router)

module.exports = {
  app, server,
}
