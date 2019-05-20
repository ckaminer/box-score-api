const mongoAdapter = require('../mongoAdapter')

describe('mongoAdapter', () => {
  describe('saveGame', () => {
    it('returns the created game data from mongo if the save is successful', async () => {
      const response = { league: 'MLB', id: 12345 }

      let result
      try {
        result = await mongoAdapter.saveGame({ league: 'MLB' })
      } catch (err) {
        console.log('ERROR::: ', err)
      }

      expect(result).toEqual(response)
    })
  })
})
