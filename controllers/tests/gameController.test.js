const gameController = require('../gameController')
const gameService = require('../../services/gameService')
const barstoolAdapter = require('../../adapters/barstoolAdapter')

describe('gameController', () => {
  let send
  let res
  beforeEach(() => {
    send = jest.fn()
    res = {
      status: jest.fn(() => ({
        send,
      })),
    }
  })
  describe('#gamesListController', () => {
    const { gameIdMap } = barstoolAdapter
    it('should return a 200 with all games upon success', async () => {
      const games = [
        {
          league: 'MLB',
          home_team: { first_name: 'Boston', last_name: 'Red Sox' },
          away_team: { first_name: 'New York', last_name: 'Yankees' },
        },
        {
          league: 'NBA',
          home_team: { first_name: 'Boston', last_name: 'Celtics' },
          away_team: { first_name: 'New York', last_name: 'Knicks' },
        },
      ]

      const req = {
        url: 'www.blamo.com/api/v1/games',
        method: 'GET',
        query: {},
      }

      const serviceMock = jest.spyOn(gameService, 'getGamesList')
        .mockResolvedValueOnce(games)

      await gameController.gamesListController(req, res)

      const expectedServiceParams = Object.keys(gameIdMap).map(key => gameIdMap[key])

      expect(serviceMock).toHaveBeenCalledWith(expectedServiceParams)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(send).toHaveBeenCalledWith(games)
    })

    it('should return a 200 with all games for a specified league when the query param is provided', async () => {
      const games = [
        {
          league: 'MLB',
          home_team: { first_name: 'Boston', last_name: 'Red Sox' },
          away_team: { first_name: 'New York', last_name: 'Yankees' },
        },
      ]

      const req = {
        url: 'www.blamo.com/api/v1/games',
        method: 'GET',
        query: { league: 'MLB' },
      }

      const serviceMock = jest.spyOn(gameService, 'getGamesList')
        .mockResolvedValueOnce(games)

      await gameController.gamesListController(req, res)

      expect(serviceMock).toHaveBeenCalledWith([gameIdMap.MLB])
      expect(res.status).toHaveBeenCalledWith(200)
      expect(send).toHaveBeenCalledWith(games)
    })

    it('should return a 400 if the provided league is not supported', async () => {
      const req = {
        url: 'www.blamo.com/api/v1/games',
        method: 'GET',
        query: { league: 'MLL' },
      }

      const serviceMock = jest.spyOn(gameService, 'getGamesList')

      await gameController.gamesListController(req, res)

      expect(serviceMock).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(send).toHaveBeenCalledWith({ message: 'Invalid league' })
    })

    it('should return an error code from the thrown error if provided', async () => {
      const req = {
        url: 'www.blamo.com/api/v1/games',
        method: 'GET',
        query: {},
      }

      const error = { status: 400 }

      jest.spyOn(gameService, 'getGamesList').mockRejectedValueOnce(error)

      await gameController.gamesListController(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(send).toHaveBeenCalledWith({ message: 'Unable to retrieve game data' })
    })

    it('should return a 500 if the thrown error does not have a status code', async () => {
      const req = {
        url: 'www.blamo.com/api/v1/games',
        method: 'GET',
        query: {},
      }

      const error = { message: 'BLAMO' }

      jest.spyOn(gameService, 'getGamesList').mockRejectedValueOnce(error)

      await gameController.gamesListController(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(send).toHaveBeenCalledWith({ message: 'Unable to retrieve game data' })
    })
  })

  describe('#singleGameController', () => {
    it('should return a 200 with a single game object for the given gameId', async () => {
      const game = {
        src_id: 'abc123',
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }

      const req = {
        url: 'www.blamo.com/api/v1/games/abc123',
        method: 'GET',
        params: { gameId: 'abc123' },
      }

      const serviceMock = jest.spyOn(gameService, 'getGameById')
        .mockResolvedValueOnce(game)

      await gameController.singleGameController(req, res)

      expect(serviceMock).toHaveBeenCalledWith(game.src_id)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(send).toHaveBeenCalledWith(game)
    })

    it('should return an error if the service fails to return a game', async () => {
      const req = {
        url: 'www.blamo.com/api/v1/games/abc123',
        method: 'GET',
        params: { gameId: 'abc123' },
      }

      const serviceMock = jest.spyOn(gameService, 'getGameById')
        .mockRejectedValueOnce({ status: 404 })

      await gameController.singleGameController(req, res)

      expect(serviceMock).toHaveBeenCalledWith('abc123')
      expect(res.status).toHaveBeenCalledWith(404)
      expect(send).toHaveBeenCalledWith({ message: 'Unable to retrieve game data' })
    })

    it('should return a 500 if the service does not return a status', async () => {
      const req = {
        url: 'www.blamo.com/api/v1/games/abc123',
        method: 'GET',
        params: { gameId: 'abc123' },
      }

      const serviceMock = jest.spyOn(gameService, 'getGameById')
        .mockRejectedValueOnce(new Error('BLAMO'))

      await gameController.singleGameController(req, res)

      expect(serviceMock).toHaveBeenCalledWith('abc123')
      expect(res.status).toHaveBeenCalledWith(500)
      expect(send).toHaveBeenCalledWith({ message: 'Unable to retrieve game data' })
    })
  })
})
