# Read

Reads enable dynamic loading of content, usually by fetching data from a remote server using an HTTP request.

## `register(uri, read)`

Registers a custom read to a specific URI or URI scheme.

### Usage

```javascript
import { read } from '@skele/core'

import navigationRead from './reads/navigation'
import articleRead from './reads/article'

read.register('x-myapp://navigation', navigationRead)
read.register(/x-myapp:\/\/article/, articleRead)
```
