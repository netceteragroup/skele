# Kernel

A kernel represents the app itself. It consists of modular pieces called subsystems, responsible for different functionalities of the app. 

## `create(subsystems, initData, [config])`

Creates an app kernel using a given array of subsystems, initial structure of the app and an optional configuration. 

### Usage

```javascript
import { Kernel, defaultSubsystems } from '@skele/core'
import navigationSubsystem from './customSubsystems/navigation'

const initData = { kind: 'app' }

Kernel.create(
  [...defaultSubsystems, navigationSubsystem],
  initData
)
```
