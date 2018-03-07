# Transform

Transformers are functions that enable simple transformations of elements. A transformer is triggered during the execution of a read.

## `register(kind, fn)`

Registers a transformer to a specific kind.

### Usage

```javascript
import { transform } from '@skele/core'

transform.register('scene', element =>
  element.setIn(['metadata', 'title'], 'Home page')
)
```
