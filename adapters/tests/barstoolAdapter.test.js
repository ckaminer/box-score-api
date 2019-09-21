const axios = require('axios')

const barstoolAdapter = require('../barstoolAdapter')
const mlbData = require('../../data/mlbData')

describe('barstoolAdapter', () => {
  describe('#getGameById', () => {
    it('returns the game data from barstool for the given gameId', async () => {
      const response = { data: mlbData, status: 200 }

      const axiosMock = jest.spyOn(axios, 'request').mockResolvedValueOnce(response)

      const id = 'eed38457-db28-4658-ae4f-4d4d38e9e212'
      const request = {
        method: 'GET',
        url: `https://chumley.barstoolsports.com/dev/data/games/${id}.json`,
      }

      const result = await barstoolAdapter.getGameById(id)

      expect(axiosMock).toHaveBeenCalledWith(request)
      expect(result).toEqual(response.data)
    })

    it('throws an error if the axios request fails', async (done) => {
      const response = { response: 'request failed: game not found', status: 404 }

      const axiosMock = jest.spyOn(axios, 'request').mockRejectedValueOnce(response)

      const id = '6c974274-4bfc-4af8-a9c4-8b926637ba74'
      const request = {
        method: 'GET',
        url: `https://chumley.barstoolsports.com/dev/data/games/${id}.json`,
      }

      try {
        await barstoolAdapter.getGameById(id)
        done.fail()
      } catch (error) {
        expect(error).toEqual(response)
      }

      expect(axiosMock).toHaveBeenCalledWith(request)
      done()
    })
  })
})
