# Subsystem

A subsystem is a modular part of an app responsible for providing a particular functionality to the kernel.

## `create(subsystemFn)`

Creates a subsystem using a subsystem generation function.

### Usage

```javascript
import { Subsystem } from '@skele/classic'

const navigationSubsystem = Subsystem.create(system => {
  return {
    name: 'navigation',
    start: system => console.log('Started the navigation subsystem...'),
  }
})
```

## `fromMiddleware(middleware, name)`

Creates a subsystem from a middleware.

### Usage

```javascript
import { Kernel, Subsystem, defaultSubsystems } from '@skele/classic'
import { tracking, logging } from './middleware'

const initData = { kind: 'app' }

const middleware = [
  Subsystem.fromMiddleware(tracking, 'tracking'),
  Subsystem.fromMiddleware(logging, 'logging'),
]

Kernel.create([...defaultSubsystems, ...middleware], initData)
```
