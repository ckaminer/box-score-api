/* eslint-disable no-underscore-dangle */
const superagent = require('superagent')

describe('game routes', () => {
  const sleep = (ms) => (
    new Promise(resolve => setTimeout(resolve, ms))
  )

  describe('GET /api/v1/games', () => {
    it('should return a 200 with all games upon success', async () => {
      const url = 'http://localhost:8081/api/v1/games'
      const gamesResponse = await superagent.get(url)

      const leagues = ['NBA', 'MLB']
      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(2)
      expect(leagues.indexOf(gamesResponse.body[0].league)).not.toEqual(-1)
      expect(leagues.indexOf(gamesResponse.body[1].league)).not.toEqual(-1)
    })

    it('should return all games from the cache if less than 15 seconds old or refresh cache if greater', async () => {
      await sleep(15000)
      const url = 'http://localhost:8081/api/v1/games'
      const gamesResponse = await superagent.get(url)

      const leagues = ['NBA', 'MLB']
      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(2)
      expect(leagues.indexOf(gamesResponse.body[0].league)).not.toEqual(-1)
      expect(leagues.indexOf(gamesResponse.body[1].league)).not.toEqual(-1)

      // assert that games did not come from cache (no updated_at)
      expect(gamesResponse.body[0].updated_at).toBeUndefined()
      expect(gamesResponse.body[1].updated_at).toBeUndefined()

      // === Call again immediately to check for cached response ===
      const cachedResponse = await superagent.get(url)

      expect(cachedResponse.status).toEqual(200)
      expect(cachedResponse.body.length).toEqual(2)
      expect(cachedResponse.body[0].updated_at).not.toBeUndefined()
      expect(cachedResponse.body[1].updated_at).not.toBeUndefined()
      // =====================================================

      // === Wait 15 seconds and see if data is retrieved from original source again ===
      await sleep(15000)
      const refreshedResponse = await superagent.get(url)

      expect(refreshedResponse.status).toEqual(200)
      expect(refreshedResponse.body.length).toEqual(2)
      expect(refreshedResponse.body[0].updated_at).toBeUndefined()
      expect(refreshedResponse.body[1].updated_at).toBeUndefined()
      // =====================================================

      // === Call again immediately to check for new cached response ===
      const updatedCachedResponse = await superagent.get(url)

      expect(updatedCachedResponse.status).toEqual(200)
      expect(updatedCachedResponse.body.length).toEqual(2)
      expect(updatedCachedResponse.body[0].updated_at).not.toBeUndefined()
      expect(updatedCachedResponse.body[1].updated_at).not.toBeUndefined()
      // =====================================================

      // === Compare first cache timestamp with new cached timestamp ===
      const oldTime1 = cachedResponse.body[0].updated_at
      const oldTime2 = cachedResponse.body[1].updated_at
      const newTime1 = updatedCachedResponse.body[0].updated_at
      const newTime2 = updatedCachedResponse.body[1].updated_at
      const timesChanged = (newTime1 !== oldTime1
        && newTime1 !== oldTime2
        && newTime2 !== oldTime1
        && newTime2 !== oldTime2)
      expect(timesChanged).toBe(true)
      expect(newTime1 > oldTime1 && newTime1 > oldTime2).toBe(true)
      expect(newTime2 > oldTime1 && newTime2 > oldTime2).toBe(true)
    }, 40000)

    it('should return a 200 with all games for the MLB when the query param is provided', async () => {
      const url = 'http://localhost:8081/api/v1/games?league=MLB'
      const gamesResponse = await superagent.get(url)

      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(1)
      expect(gamesResponse.body[0].league).toEqual('MLB')
    })

    it('should return a 200 with all games for the NBA when the query param is provided', async () => {
      const url = 'http://localhost:8081/api/v1/games?league=NBA'
      const gamesResponse = await superagent.get(url)

      expect(gamesResponse.status).toEqual(200)
      expect(gamesResponse.body.length).toEqual(1)
      expect(gamesResponse.body[0].league).toEqual('NBA')
    })

    it('should return a 400 if an invalid league is provided', async (done) => {
      const url = 'http://localhost:8081/api/v1/games?league=MLS'

      try {
        await superagent.get(url)
        done.fail('expected to receive an error')
      } catch (err) {
        expect(err.status).toEqual(400)
        expect(err.response.body).toEqual({ message: 'Invalid league' })
      }

      done()
    })
  })

  describe('GET /api/v1/games/:gameId', () => {
    it('should return a 200 with the specified game upon success', async () => {
      const gameId = 'eed38457-db28-4658-ae4f-4d4d38e9e212'

      const url = `http://localhost:8081/api/v1/games/${gameId}`
      const gameResponse = await superagent.get(url)
      expect(gameResponse.status).toEqual(200)

      const game = gameResponse.body
      expect(game.league).toEqual('MLB')
      expect(game).toHaveProperty('away_team')
      expect(game).toHaveProperty('home_team')
      expect(game).toHaveProperty('officials')
      expect(game).toHaveProperty('event_information')
    })

    it('should return the game from the cache if less than 15 seconds old or refresh cache if greater', async () => {
      await sleep(15000)
      const gameId = 'eed38457-db28-4658-ae4f-4d4d38e9e212'
      const url = `http://localhost:8081/api/v1/games/${gameId}`
      const gameResponse = await superagent.get(url)

      const game = gameResponse.body
      expect(gameResponse.status).toEqual(200)
      expect(game.league).toEqual('MLB')
      expect(game).toHaveProperty('away_team')
      expect(game).toHaveProperty('home_team')
      expect(game).toHaveProperty('officials')
      expect(game).toHaveProperty('event_information')

      // assert that game did not come from cache (no updated_at)
      expect(game.updated_at).toBeUndefined()
      expect(game.src_id).toBeUndefined()

      // === Call again immediately to check for cached response ===
      const cachedResponse = await superagent.get(url)
      const cachedGame = cachedResponse.body

      expect(cachedResponse.status).toEqual(200)
      expect(cachedGame.league).toEqual('MLB')
      expect(cachedGame.updated_at).not.toBeUndefined()
      expect(cachedGame.src_id).toEqual(gameId)
      // =====================================================

      // === Wait 15 seconds and see if data is retrieved from original source again ===
      await sleep(15000)
      const refreshedResponse = await superagent.get(url)
      const refreshedGame = refreshedResponse.body

      expect(refreshedResponse.status).toEqual(200)
      expect(refreshedGame.league).toEqual('MLB')
      expect(refreshedGame.updated_at).toBeUndefined()
      expect(refreshedGame.src_id).toBeUndefined()
      // =====================================================

      // === Call again immediately to check for new cached response ===
      const updatedCachedResponse = await superagent.get(url)
      const updatedCachedGame = updatedCachedResponse.body

      expect(updatedCachedResponse.status).toEqual(200)
      expect(updatedCachedGame.league).toEqual('MLB')
      expect(updatedCachedGame.updated_at).not.toBeUndefined()
      expect(updatedCachedGame.src_id).toEqual(gameId)
      // =====================================================

      // === Compare first cache timestamp with new cached timestamp ===
      const oldTime = cachedGame.updated_at
      const newTime = updatedCachedGame.updated_at
      expect(newTime > oldTime).toBe(true)

      // === Games from cache should be identical except for timestamp and mongo id ===
      delete cachedGame.updated_at
      delete cachedGame._id
      delete updatedCachedGame.updated_at
      delete updatedCachedGame._id
      expect(cachedGame).toEqual(updatedCachedGame)
    }, 40000)
  })
})
