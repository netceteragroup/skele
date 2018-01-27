# Enrich

## `register(kind, asyncFn)`

Registers an enricher to a specific kind.

### Usage

```javascript
import { enrich } from '@girders-elements/core'
import I from 'immutable'

enrich.register(['scene', 'article', 'briefing'], async el => {
  await sleep(50)
  return el.update('items', items =>
    items.insert(0, I.fromJS({
      kind: ['header', 'briefing']
    }))
  )
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
```
