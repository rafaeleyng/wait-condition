const waitCondition = require('../')

describe('waitCondition', () => {
  describe('condition settled imediately', () => {
    it('should resolve when condition is met', () => {
      const condition = () => ({ done: true, value: 123 })

      return waitCondition(condition)
        .then((value) => {
          expect(value).toEqual(123)
        })
    })

    it('should reject when an error occurs while evaluating condition', () => {
      const condition = () => { throw new Error('error in condition!') }

      return waitCondition(condition)
        .then(() => {
          throw new Error('should reject when error occurs in condition')
        })
        .catch((reason) => {
          expect(reason.message).toContain('error on condition')
        })
    })
  })

  describe('condition settled later', () => {
    it('should resolve when condition is met', () => {
      let attempts = 0
      const condition = () => {
        if (attempts > 10) {
          return {
            done: true,
            value: 234,
          }
        }
        attempts += 1
        return null
      }

      return waitCondition(condition, { initialInterval: 10, attemptsBeforeSlowing: 5 })
        .then((value) => {
          expect(value).toEqual(234)
        })
    })

    it('should reject when an error occurs while evaluating condition', () => {
      let attempts = 0
      const condition = () => {
        if (attempts > 10) {
          throw new Error('error in the condition!')
        }
        attempts += 1
        return null
      }

      return waitCondition(condition, { initialInterval: 10 })
        .then(() => {
          throw new Error('should reject when error occurs in condition')
        })
        .catch((reason) => {
          expect(reason.message).toContain('error on condition')
        })
    })

    it('should reject when timeout is reached', () => {
      const condition = () => null

      return waitCondition(condition, { initialInterval: 10, timeout: 100 })
        .then(() => {
          throw new Error('should reject when timeout is done')
        })
        .catch((reason) => {
          expect(reason.message).toContain('timeout on condition')
        })
    })
  })
})
