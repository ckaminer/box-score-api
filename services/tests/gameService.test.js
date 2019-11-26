const objectId = require('mongodb').ObjectID
const gameService = require('../gameService')
const barstoolAdapter = require('../../adapters/barstoolAdapter')
const mongoAdapter = require('../../adapters/mongoAdapter')

describe('gameService', () => {
  describe('#getGameById', () => {
    it('should return a single game from the mongo cache if it is less than 15 seconds old', async () => {
      const game = {
        _id: objectId(),
        updated_at: Date.now(),
        src_id: 'eed38457-db28-4658-ae4f-4d4d38e9e212',
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }

      const mongoMock = jest.spyOn(mongoAdapter, 'findSingleGame')
        .mockResolvedValueOnce(game)
      const barstoolMock = jest.spyOn(barstoolAdapter, 'getGameById')

      const result = await gameService.getGameById(game.src_id)

      expect(mongoMock).toHaveBeenCalledWith({ src_id: game.src_id })
      expect(barstoolMock).not.toHaveBeenCalled()
      expect(result).toEqual(game)
    })

    it('should return a single game from the barstool adapter if cache is more than 15 seconds old', async () => {
      const mongoGame = {
        _id: '5d7d32ca23c9ad2808b7caba', // old objectId taken from mongo instance
        updated_at: new Date(2019, 1, 1),
        src_id: 'eed38457-db28-4658-ae4f-4d4d38e9e212',
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }

      const { _id, ...barstoolGame } = mongoGame

      const mongoFindMock = jest.spyOn(mongoAdapter, 'findSingleGame')
        .mockResolvedValueOnce(mongoGame)
      const barstoolMock = jest.spyOn(barstoolAdapter, 'getGameById')
        .mockResolvedValueOnce(barstoolGame)
      const mongoUpsertMock = jest.spyOn(mongoAdapter, 'upsertGame')
        .mockResolvedValueOnce()

      const result = await gameService.getGameById(mongoGame.src_id)

      expect(mongoFindMock).toHaveBeenCalledWith({ src_id: mongoGame.src_id })
      expect(barstoolMock).toHaveBeenCalledWith(mongoGame.src_id)
      expect(mongoUpsertMock).toHaveBeenCalledWith(barstoolGame)
      expect(result).toEqual(barstoolGame)
    })

    it('should return a single game from the barstool adapter if mongo call fails', async () => {
      const game = {
        src_id: 'eed38457-db28-4658-ae4f-4d4d38e9e212',
        updated_at: Date.now(),
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }

      const mongoFindMock = jest.spyOn(mongoAdapter, 'findSingleGame')
        .mockRejectedValueOnce(new Error('BLAMO'))
      const barstoolMock = jest.spyOn(barstoolAdapter, 'getGameById')
        .mockResolvedValueOnce(game)
      const mongoUpsertMock = jest.spyOn(mongoAdapter, 'upsertGame')
        .mockResolvedValueOnce()

      const result = await gameService.getGameById(game.src_id)

      expect(mongoFindMock).toHaveBeenCalledWith({ src_id: game.src_id })
      expect(barstoolMock).toHaveBeenCalledWith(game.src_id)
      expect(mongoUpsertMock).toHaveBeenCalledWith(game)
      expect(result).toEqual(game)
    })

    it('should return an error if barstool needs to be called and it returns an error', async (done) => {
      const gameId = 'eed38457-db28-4658-ae4f-4d4d38e9e212'

      const mongoFindMock = jest.spyOn(mongoAdapter, 'findSingleGame')
        .mockRejectedValueOnce(new Error('MONGO BLAMO'))
      const barstoolMock = jest.spyOn(barstoolAdapter, 'getGameById')
        .mockRejectedValueOnce(new Error('BARSTOOL BLAMO'))
      const mongoUpdateMock = jest.spyOn(mongoAdapter, 'upsertGame')

      try {
        await gameService.getGameById(gameId)
        done.fail('Expected game service to fail but it did not.')
      } catch (err) {
        expect(mongoFindMock).toHaveBeenCalledWith({ src_id: gameId })
        expect(barstoolMock).toHaveBeenCalledWith(gameId)
        expect(mongoUpdateMock).not.toHaveBeenCalled()
      }
      done()
    })
  })

  describe('#getGamesList', () => {
    it('should return a list of games for the given ids', async () => {
      const game = {
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }
      const mongoMock = jest.spyOn(mongoAdapter, 'findSingleGame')
        .mockResolvedValueOnce(game)

      const expectedResult = [game]
      const id = '1234567890-abcdef'
      const result = await gameService.getGamesList([id])

      expect(mongoMock).toHaveBeenCalledWith({ src_id: id })
      expect(result).toEqual(expectedResult)
    })

    it('should throw an error if either adapter call fails', async (done) => {
      const mlbGame = {
        league: 'MLB',
        home_team: { first_name: 'Boston', last_name: 'Red Sox' },
        away_team: { first_name: 'New York', last_name: 'Yankees' },
      }

      const mongoMock = jest.spyOn(mongoAdapter, 'findSingleGame')
        .mockResolvedValueOnce(mlbGame)
        .mockRejectedValueOnce('BLAMO')

      const barstoolMock = jest.spyOn(barstoolAdapter, 'getGameById')
        .mockRejectedValueOnce({ response: 'Request failed', status: 400 })

      const ids = ['abc', '123']
      try {
        await gameService.getGamesList(ids)
        done.fail('Expected get games list to return an error but it did not.')
      } catch (error) {
        expect(mongoMock).toHaveBeenCalledTimes(2)
        expect(mongoMock).toHaveBeenCalledWith({ src_id: ids[0] })
        expect(mongoMock).toHaveBeenCalledWith({ src_id: ids[1] })

        expect(barstoolMock).toHaveBeenCalledTimes(1)
        expect(barstoolMock).toHaveBeenCalledWith(ids[1])

        expect(error.message).toEqual('Failed to retrieve game 123')
      }

      done()
    })
  })

  describe('#sortGamesByLeagueAndDate', () => {
    it('Should return the passed in games list sorted first by league and second by start date', () => {
      const nbaOne = {
        league: 'NBA',
        event_information: {
          start_date_time: '2012-06-21T18:00:00-07:00',
        },
      }
      const nbaTwo = {
        league: 'NBA',
        event_information: {
          start_date_time: '2012-06-25T18:00:00-07:00',
        },
      }
      const nbaThree = {
        league: 'NBA',
        event_information: {
          start_date_time: '2012-06-25T15:00:00-07:00',
        },
      }
      const mlbOne = {
        league: 'MLB',
        event_information: {
          start_date_time: '2012-06-25T17:00:00-07:00',
        },
      }
      const mlbTwo = {
        league: 'MLB',
        event_information: {
          start_date_time: '2012-06-20T15:00:00-07:00',
        },
      }
      const mlbThree = {
        league: 'MLB',
        event_information: {
          start_date_time: '2012-06-25T18:00:00-07:00',
        },
      }

      const games = [nbaOne, nbaTwo, nbaThree, mlbOne, mlbTwo, mlbThree]
      const sortedGames = gameService.sortGamesByLeagueAndDate(games)

      expect(sortedGames[0]).toEqual(mlbTwo)
      expect(sortedGames[1]).toEqual(mlbOne)
      expect(sortedGames[2]).toEqual(mlbThree)
      expect(sortedGames[3]).toEqual(nbaOne)
      expect(sortedGames[4]).toEqual(nbaThree)
      expect(sortedGames[5]).toEqual(nbaTwo)
    })
  })
})
