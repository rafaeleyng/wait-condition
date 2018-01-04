const timeoutReached = (startTime, timeout) => startTime + timeout < Date.now()

/*
  Receives a condition and returns a Promise.
    - `condition` should be a function that returns falsy or an object like:
      {
        done: <boolean>,
        value: <anything>,
      }

      The condition is considered met when the `done` property is `true`.

  Checks continously for the condition and:
    - resolves the Promise with the `value` property of `condition` result, if condition is met before timeout
    - rejects the Promise if the condition is not met before timeout, or when an error occurs while evaluating the condition
*/

const waitCondition = (condition, { initialInterval = 100, attemptsBeforeSlowing = 20, timeout = 60000 } = {}) => {
  const startTime = Date.now()

  let attempts = 0
  let currentInterval = initialInterval
  let intervalId
  let conditionResult

  // check whether condition is immediately met
  try {
    conditionResult = condition()
  } catch (e) {
    // error in condition
    return Promise.reject(new Error(`[waitCondition] error on condition:\n ${condition}`))
  }

  // immediately success in condition
  if (conditionResult && conditionResult.done) {
    return Promise.resolve(conditionResult.value)
  }

  // condition is not immediately met
  return new Promise((resolve, reject) => {
    const scheduleRun = time => setInterval(() => {
      try {
        conditionResult = condition()
      } catch (e) {
        // error in condition
        clearInterval(intervalId)
        reject(new Error(`[waitCondition] error on condition:\n ${condition}`))
        return
      }

      // success
      if (conditionResult && conditionResult.done) {
        clearInterval(intervalId)
        resolve(conditionResult.value)
        return
      }

      // timeout
      if (timeoutReached(startTime, timeout)) {
        clearInterval(intervalId)
        reject(new Error(`[waitCondition] timeout on condition:\n ${condition}`))
        return
      }

      // slowing down
      if (attempts > attemptsBeforeSlowing) {
        attempts = 0
        currentInterval *= 2
        clearInterval(intervalId)
        intervalId = scheduleRun(currentInterval)
        return
      }

      attempts += 1
    }, time)

    intervalId = scheduleRun(currentInterval)
  })
}

export default waitCondition
