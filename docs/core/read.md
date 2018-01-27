# Read

## `register(uri, read)`

Registers a custom read to a specific URI or URI scheme.

### Usage

```javascript
import { read } from '@girders-elements/core'

import navigationRead from './reads/navigation'
import articleRead from './reads/article'

read.register('x-myapp://navigation', navigationRead)
read.register(/x-myapp:\/\/article/, articleRead)
```
