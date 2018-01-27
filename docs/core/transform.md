# Transform

## `register(kind, fn)`

Registers a transformer to a specific kind.

### Usage

```javascript
import { transform } from '@girders-elements/core'

transform.register('scene', element =>
  element.setIn(['metadata', 'title'], 'Home page')
)
```
