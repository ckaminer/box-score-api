const nbaData = require('../data/nbaData.js')
const mlbData = require('../data/mlbData.js')

function allData(req, res) {
  res.status(200).send([nbaData.game, mlbData.game])
}

module.exports = {
  allData,
}
