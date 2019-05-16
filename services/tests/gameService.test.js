const gameService = require('../gameService')
const barstoolAdapter = require('../../adapters/barstoolAdapter')

describe('gameService', () => {
  describe('#getGamesList', () => {
    afterEach(() => {
      barstoolAdapter.getAllGames.mockClear()
    })
    it('should return a list of games for either MLB or NBA', async () => {
      const game = {
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }
      const barstoolMock = jest.spyOn(barstoolAdapter, 'getAllGames')
        .mockResolvedValueOnce([game])

      const expectedResult = [game]

      const result = await gameService.getGamesList('MLB')

      expect(barstoolMock).toHaveBeenCalledWith('MLB')
      expect(result).toEqual(expectedResult)
    })

    it('should return a list of all games if league is ALL', async () => {
      const mlbGame = {
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }
      const nbaGame = {
        league: 'NBA',
        home_team: { first_name: 'Boston', last_name: 'Celtics' },
        away_team: { first_name: 'New York', last_name: 'Knicks' },
      }
      const barstoolMock = jest.spyOn(barstoolAdapter, 'getAllGames')
        .mockResolvedValueOnce([mlbGame])
        .mockResolvedValueOnce([nbaGame])

      const expectedResult = [mlbGame, nbaGame]

      const result = await gameService.getGamesList('ALL')

      expect(barstoolMock).toHaveBeenCalledTimes(2)
      expect(barstoolMock).toHaveBeenCalledWith('MLB')
      expect(barstoolMock).toHaveBeenCalledWith('NBA')
      expect(result).toEqual(expectedResult)
    })

    it('should throw an error if either adapter call fails', async (done) => {
      const mlbGame = {
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }

      const barstoolMock = jest.spyOn(barstoolAdapter, 'getAllGames')
        .mockResolvedValueOnce([mlbGame])
        .mockRejectedValueOnce({ response: 'Request failed', status: 400 })

      try {
        await gameService.getGamesList('ALL')
        done.fail()
      } catch (error) {
        expect(barstoolMock).toHaveBeenCalledTimes(2)
        expect(barstoolMock).toHaveBeenCalledWith('MLB')
        expect(barstoolMock).toHaveBeenCalledWith('NBA')

        expect(error.response).toEqual('Request failed')
        expect(error.status).toEqual(400)
      }

      done()
    })
  })
})
