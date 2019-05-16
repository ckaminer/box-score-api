const axios = require('axios')

const barstoolAdapter = require('../barstoolAdapter')
const mlbData = require('../../data/mlbData')

describe('barstoolAdapter', () => {
  describe('send', () => {
    it('returns the game data from barstool if the given league is MLB', async () => {
      const response = { data: mlbData, status: 200 }

      const axiosMock = jest.spyOn(axios, 'request').mockResolvedValueOnce(response)

      const request = {
        method: 'GET',
        url: 'https://chumley.barstoolsports.com/dev/data/games/eed38457-db28-4658-ae4f-4d4d38e9e212.json',
      }

      const result = await barstoolAdapter.getAllGames('MLB')

      expect(axiosMock).toHaveBeenCalledWith(request)
      expect(result).toEqual(response.data)
    })

    it('returns the game data from barstool if the given league is NBA', async () => {
      const response = { data: mlbData, status: 200 }

      const axiosMock = jest.spyOn(axios, 'request').mockResolvedValueOnce(response)

      const request = {
        method: 'GET',
        url: 'https://chumley.barstoolsports.com/dev/data/games/6c974274-4bfc-4af8-a9c4-8b926637ba74.json',
      }

      const result = await barstoolAdapter.getAllGames('NBA')

      expect(axiosMock).toHaveBeenCalledWith(request)
      expect(result).toEqual(response.data)
    })

    it('throws an error if the axios request fails', async (done) => {
      const response = { response: 'request failed: game not found', status: 404 }

      const axiosMock = jest.spyOn(axios, 'request').mockRejectedValueOnce(response)

      const request = {
        method: 'GET',
        url: 'https://chumley.barstoolsports.com/dev/data/games/6c974274-4bfc-4af8-a9c4-8b926637ba74.json',
      }

      try {
        await barstoolAdapter.getAllGames('NBA')
        done.fail()
      } catch (error) {
        expect(error).toEqual(response)
      }

      expect(axiosMock).toHaveBeenCalledWith(request)
      done()
    })

    it('throws an error if an invalid league is provided', async (done) => {
      const response = { response: 'Invalid league', status: 400 }

      axios.request = jest.fn()

      try {
        await barstoolAdapter.getAllGames('CHESS')
        done.fail()
      } catch (error) {
        expect(error).toEqual(response)
      }

      expect(axios.request).not.toHaveBeenCalled()
      done()
    })
  })
})
