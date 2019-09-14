const mongoClient = require('mongodb').MongoClient
const mongoAdapter = require('../mongoAdapter')

describe('mongoAdapter', () => {
  afterEach(() => {
    mongoClient.connect.mockClear()
  })
  const setUpConnMock = (mockCollFuncs) => {
    return {
      url: 'mongodb://127.0.0.1:27017/BOX_SCORE',
      close: jest.fn(),
      db: jest.fn().mockReturnValueOnce({
        collection: jest.fn().mockReturnValueOnce(mockCollFuncs),
      }),
    }
  }
  describe('connect', () => {
    it('returns a connection to the database upon success', async (done) => {
      const connection = { url: 'mongodb://127.0.0.1:27017/BOX_SCORE' }

      const mongoMock = jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(connection)

      let result
      try {
        result = await mongoAdapter.connect()
      } catch (err) {
        done.fail('Failed to connect to mongo')
      }

      expect(mongoMock).toHaveBeenCalled()
      expect(result).toEqual(connection)
      done()
    })

    it('returns an error when the connection fails', async (done) => {
      const error = new Error('Failed to connect!')

      const mongoMock = jest.spyOn(mongoClient, 'connect').mockRejectedValueOnce(error)

      try {
        await mongoAdapter.connect()
        done.fail('Expected a connection error but got none')
      } catch (err) {
        expect(err).toEqual(error)
      }

      expect(mongoMock).toHaveBeenCalled()
      done()
    })
  })

  describe('saveGame', () => {
    it('returns the created game data from mongo if the save is successful', async (done) => {
      const response = { ops: [{ league: 'MLB', id: 12345 }] }
      const mockInsert = jest.fn().mockResolvedValueOnce(response)

      const conn = setUpConnMock({ insertOne: mockInsert })

      jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(conn)

      let result
      try {
        result = await mongoAdapter.saveGame({ league: 'MLB' })
      } catch (err) {
        done.fail(`Failed to save game due to: ${err}`)
      }

      expect(mockInsert).toHaveBeenCalled()
      expect(result).toEqual(response.ops[0])
      done()
    })

    it('returns an error if the document fails to insert', async (done) => {
      const error = new Error('Failed to insert game in collection')
      const mockInsert = jest.fn().mockRejectedValueOnce(error)

      const conn = setUpConnMock({ insertOne: mockInsert })

      jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(conn)

      try {
        await mongoAdapter.saveGame({ league: 'MLB' })
        done.fail('Expected insert to fail but it did not.')
      } catch (err) {
        expect(err).toEqual(error)
      }

      expect(mockInsert).toHaveBeenCalled()
      done()
    })

    it('returns an error if the connection fails to open', async (done) => {
      const error = new Error('Failed to conenct to DB')
      jest.spyOn(mongoClient, 'connect').mockRejectedValueOnce(error)

      try {
        await mongoAdapter.saveGame({ league: 'MLB' })
        done.fail('Expected insert to fail but it did not.')
      } catch (err) {
        expect(err).toEqual(error)
      }

      done()
    })
  })

  describe('find functionality', () => {
    const mockSort = jest.fn()
    const setUpFindMock = (response) => {
      const mockFindResponse = {
        sort: mockSort.mockReturnValueOnce({
          toArray: jest.fn().mockResolvedValueOnce(response),
        }),
      }
      return jest.fn().mockReturnValueOnce(mockFindResponse)
    }
    describe('findGames', () => {
      it('should return a collection of games for the given query', async (done) => {
        const game = { _id: '12345', league: 'MLB' }
        const mockFind = setUpFindMock([game])
        const conn = setUpConnMock({ find: mockFind })

        jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(conn)

        const query = { league: 'MLB' }
        let result
        try {
          result = await mongoAdapter.findGames(query)
        } catch (err) {
          done.fail(`Failed to find games due to: ${err}`)
        }

        expect(mockFind).toHaveBeenCalledWith(query)
        expect(mockSort).toHaveBeenCalledWith({ _id: -1 })
        expect(result).toEqual([game])
        done()
      })

      it('returns an error if the connection fails to open', async (done) => {
        const error = new Error('Failed to conenct to DB')
        jest.spyOn(mongoClient, 'connect').mockRejectedValueOnce(error)

        try {
          await mongoAdapter.findGames()
          done.fail('Expected find to fail but it did not.')
        } catch (err) {
          expect(err).toEqual(error)
        }

        done()
      })
    })

    describe('findAllGames', () => {
      it('should find all games in the collection', async (done) => {
        const game = { _id: '12345', league: 'MLB' }
        const mockFind = setUpFindMock([game])
        const conn = setUpConnMock({ find: mockFind })

        jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(conn)

        let result
        try {
          result = await mongoAdapter.findAllGames()
        } catch (err) {
          done.fail(`Failed to find games due to: ${err}`)
        }

        expect(mockFind).toHaveBeenCalledWith({})
        expect(mockSort).toHaveBeenCalledWith({ _id: -1 })
        expect(result).toEqual([game])
        done()
      })
    })

    describe('findAllGamesByLeague', () => {
      it('should find all games in the collection that match the specified league', async (done) => {
        const game = { _id: '12345', league: 'MLB' }
        const mockFind = setUpFindMock([game])
        const conn = setUpConnMock({ find: mockFind })

        jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(conn)

        let result
        try {
          result = await mongoAdapter.findAllGamesByLeague('MLB')
        } catch (err) {
          done.fail(`Failed to find games due to: ${err}`)
        }

        expect(mockFind).toHaveBeenCalledWith({ league: 'MLB' })
        expect(mockSort).toHaveBeenCalledWith({ _id: -1 })
        expect(result).toEqual([game])
        done()
      })
    })

    describe('findSingleGame', () => {
      it('should find a game in the collection that matches the provided event info', async (done) => {
        const game = { _id: '12345', league: 'MLB' }
        const mockFind = setUpFindMock([game])
        const conn = setUpConnMock({ find: mockFind })

        jest.spyOn(mongoClient, 'connect').mockResolvedValueOnce(conn)

        const eventInfo = {
          temperature: 71,
          site: {
            capacity: 45050,
            surface: 'Grass',
            name: 'Angel Stadium of Anaheim',
            state: 'California',
            city: 'Anaheim',
          },
          attendance: 37916,
          duration: '3:03',
          status: 'completed',
          season_type: 'regular',
          start_date_time: '2012-09-26T19:05:00-07:00',
        }
        let result
        try {
          result = await mongoAdapter.findSingleGame(eventInfo)
        } catch (err) {
          done.fail(`Failed to find games due to: ${err}`)
        }

        expect(mockFind).toHaveBeenCalledWith(eventInfo)
        expect(mockSort).toHaveBeenCalledWith({ _id: -1 })
        expect(result).toEqual(game)
        done()
      })
    })
  })
})
