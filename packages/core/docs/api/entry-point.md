# Entry Point

Provides an entry point to the kernel.

## Usage

```javascript
import React from 'react'
import { EntryPoint } from '@skele/core'

export const EntryPointWrapper = system =>
  class extends React.Component {
    render() {
      return <EntryPoint kernel={system} keyPath={['scene', 0]} />
    }
  }
```
