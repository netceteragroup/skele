# Data

Utility functions for easier handling and processing of data.

## `flow(value, ...fns)`

Executes a function composition on a given value.

### Usage

```javascript
import { effect, data } from '@skele/core'
import { pushScene } from './navigation'

effect.register('app', '.pushScene', async (context, action) =>
  data.flow(action.scene, pushScene, context.dispatch)
)
```

## `when(predicate, fn)`

A helper for easier reduce with zippers.

### Usage

```javascript
import { zip, data } from '@skele/core'
import I from 'immutable'

import { initData } from './app'

const elementZipper = zip.elementZipper({})(initData)
const sceneTitles = zip.reduce(
  data.when(
    el => el.get('kind') === 'scene',
    (acc, el) => acc.push(el.getIn(['metadata', 'title']))
  ),
  I.List(),
  elementZipper
)
```
