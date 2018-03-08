# Enrich

Enrichers are `async` functions that have access to the system context. The enrichers are executed during reads and, contrary to enhancers, are triggered on both root and child elements. An enricher results with an altered element. Enhancers are generally recommended to use instead of enrichers.

## `register(kind, asyncFn)`

Registers an enricher to a specific kind.

### Usage

```javascript
import { enrich } from '@skele/classic'
import I from 'immutable'

enrich.register(['scene', 'article', 'briefing'], async el => {
  await sleep(50)
  return el.update('items', items =>
    items.insert(
      0,
      I.fromJS({
        kind: ['header', 'briefing'],
      })
    )
  )
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
```
