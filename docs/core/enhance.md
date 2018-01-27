# Enhance

## `register(asyncFn)`

Registers an enhancer.

### Usage

```javascript
import { enhance } from '@girders-elements/core'

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
