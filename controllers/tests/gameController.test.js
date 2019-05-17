const gameController = require('../gameController')
const gameService = require('../../services/gameService')

describe('gameController', () => {
  describe('#allData', () => {
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

      await gameController.allData(req, res)

      expect(serviceMock).toHaveBeenCalledWith('ALL')
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

      await gameController.allData(req, res)

      expect(serviceMock).toHaveBeenCalledWith('MLB')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(send).toHaveBeenCalledWith(games)
    })

    it('should return an error code from the thrown error if provided', async () => {
      const req = {
        url: 'www.blamo.com/api/v1/games',
        method: 'GET',
        query: {},
      }

      const error = { status: 400 }

      const serviceMock = jest.spyOn(gameService, 'getGamesList')
        .mockRejectedValueOnce(error)

      await gameController.allData(req, res)

      expect(serviceMock).toHaveBeenCalledWith('ALL')
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

      const serviceMock = jest.spyOn(gameService, 'getGamesList')
        .mockRejectedValueOnce(error)

      await gameController.allData(req, res)

      expect(serviceMock).toHaveBeenCalledWith('ALL')
      expect(res.status).toHaveBeenCalledWith(500)
      expect(send).toHaveBeenCalledWith({ message: 'Unable to retrieve game data' })
    })
  })
})
