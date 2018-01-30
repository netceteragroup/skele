# Update

Updates are functions that enable simple transformations of elements. An update is triggered via dispatching of actions.

## `register(kind, actionType, fn)`

Registers an update to a specific kind and action type.

### Usage

```javascript
import { update } from '@girders-elements/core'

update.register(['scene', 'article'], 'toggleIsBookmarked', el =>
  el.set('isBookmarked', !el.get('isBookmarked'))
)
``` 

## `forKind(kind, registrationFn)`

Registers updates to a specific kind using a registration function.

### Usage

```javascript
import { update } from '@girders-elements/core'

update.forKind(['scene', 'article', 'briefing'], updates => {
  updates.register('toggleIsBookmarked', el =>
    el.set('bookmarked', !el.get('bookmarked')))
  updates.register('toggleIsRead', el =>
    el.set('isRead', !el.get('isRead')))
})
```
