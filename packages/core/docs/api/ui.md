# UI

Used for registration of UI components.

## `register(kind, Component)`

Registers a component to a specific kind.

### Usage

```javascript
import { ui } from '@skele/core'
import ArticleScene from './ui'

ui.register(['scene', 'article'], ArticleScene)
```
