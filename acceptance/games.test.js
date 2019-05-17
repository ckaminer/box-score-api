const superagent = require('superagent')

describe('game routes', () => {
  describe('GET /api/v1/games', () => {
    it('should return a 200 with all games upon success', async () => {
      const url = 'http://localhost:8080/api/v1/games'
      const gamesResponse = await superagent.get(url)

      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(2)
      expect(gamesResponse.body[0].league).toEqual('NBA')
      expect(gamesResponse.body[1].league).toEqual('MLB')
    })

    it('should return a 200 with all games for the MLB when the query param is provided', async () => {
      const url = 'http://localhost:8080/api/v1/games?league=MLB'
      const gamesResponse = await superagent.get(url)

      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(1)
      expect(gamesResponse.body[0].league).toEqual('MLB')
    })

    it('should return a 200 with all games for the NBA when the query param is provided', async () => {
      const url = 'http://localhost:8080/api/v1/games?league=NBA'
      const gamesResponse = await superagent.get(url)

      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(1)
      expect(gamesResponse.body[0].league).toEqual('NBA')
    })

    it('should return a 400 if an invalid league is provided', async () => {
      const url = 'http://localhost:8080/api/v1/games?league=MLS'
      const gamesResponse = await superagent.get(url)

      expect(gamesResponse.status).toEqual(400)
      expect(gamesResponse.body).toEqual({ message: 'Unable to retrieve game data' })
    })
  })
})
