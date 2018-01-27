# Effect

## `register(kind, actionType, asyncFn)`

Registers an effect to a specific kind and action type.

### Usage

```javascript
import { effect } from '@girders-elements/core'

effect.register(['scene', 'article'], '.setMarked', async (context, action) => {
  await sleep(50)
  return el => el.set('marked', action.isMarked)
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
``` 

## `forKind(kind, registrationFn)`

Registers effects to a specific kind using a registration function.

### Usage

```javascript
import { effect } from '@girders-elements/core'
import { setRead, setMarked } from './effects'

effect.forKind(['scene', 'article'], effects => {
  effects.register('setRead', setRead)
  effects.register('.setMarked', setMarked)
})
```
