# Default Subsystems

Returns the default subsystems.

## Usage

```javascript
import { Kernel, defaultSubsystems } from '@girders-elements/core'
import navigationSubsystem from './customSubsystems/navigation'

const initData = { kind: 'app' }

Kernel.create(
  [...defaultSubsystems, navigationSubsystem],
  initData
)
```
