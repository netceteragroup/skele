# Enhance

Enhancers are `async` functions that have access to the system context. The enhancers are executed during reads and are only triggered on root elements of a read. An enhancer should result with an array of updates for the element subtree.

## `register(asyncFn)`

Registers an enhancer.

### Usage

```javascript
import { enhance } from '@skele/core'

enhance.register(async context => {
  await sleep(50)
  const timestamp = new Date().getTime()
  return [
    [
      'scene', el =>
        el.update('metadata', m => m.set('timestamp', timestamp))
    ],
    [
      ['scene', 'article'], el =>
        el.update('metadata', m => m.set('type', 'article'))
    ]
  ]
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
```
