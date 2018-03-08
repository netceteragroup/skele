# Effect

Effects are `async` functions that have access to the system context. An effect can execute asynchronous operations before (optionally) altering the element to which it is registered. In order to alter an element, an effect must result with an updater function that takes the element as a single argument and returns an element as a result. Effects are triggered via dispatching of actions.

## `register(kind, actionType, asyncFn)`

Registers an effect to a specific kind and action type.

### Usage

```javascript
import { effect } from '@skele/classic'

effect.register(['scene', 'article'], '.setMarked', async (context, action) => {
  await sleep(50)
  return el => el.set('marked', action.isMarked)
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
```

## `forKind(kind, registrationFn)`

Registers effects to a specific kind using a registration function.

### Usage

```javascript
import { effect } from '@skele/classic'
import { setRead, setMarked } from './effects'

effect.forKind(['scene', 'article'], effects => {
  effects.register('setRead', setRead)
  effects.register('.setMarked', setMarked)
})
```
