# wait-condition

Resolve a promise when a condition is met.

## install

```
npm install wait-condition
```

## usage

```
const waitCondition = require('wait-condition')
// or ES6
import waitCondition from 'wait-condition'

const condition = () => {
  if (somethingIsReady()) {
    return {
      done: true,
      value: someValue,
    }
  }
  return null
}

waitCondition(condition)
  .then((someValue) => { /* will be called when somethingIsReady() */ })
  .catch((reason) => { /* will be called whether the condition causes an error or after timeout */ })
```


## options

```
// default values
waitCondition(condition, {
  initialInterval: 100, // milliseconds
  attemptsBeforeSlowing: 20,
  timeout: 60000, // milliseconds
})
```


## how it works

### short version

It starts checking the condition every `initialInterval` milliseconds. Every time `attemptsBeforeSlowing` attempts are reached, the interval is doubled, until `timeout` is reached.

### long version

`waitCondition` receives a condition and returns a Promise. `condition` should be a function that returns falsy or an object like:
{
  done: <boolean>,
  value: <anything>,
}

The condition is considered met when the `done` property is `true`.

Checks continuously for the condition and:
  - resolves the Promise with the `value` property of `condition` result, if condition is met before timeout
  - rejects the Promise if the condition is not met before timeout, or when an error occurs while evaluating the condition, and specifies the reason for rejection
