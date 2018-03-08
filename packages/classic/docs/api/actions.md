# Actions

Provides various utilities for easier working with actions.

## `actionMeta(action)`

Gets the metadata of an action.

### Usage

```javascript
import { actions, propNames } from '@skele/classic'

const tsExtractorWithActionMeta = async (action, prevState, nextState) =>
  nextState
    .getIn(actions.actionMeta(action).keyPath)
    .getIn([propNames.metadata, 'timestamp'])
```

## `actionMetaProperty`

Returns the prop name of the action metadata.

### Usage

```javascript
import { actions, propNames } from '@skele/classic'

const tsExtractorWithActionMetaProperty = async (
  action,
  prevState,
  nextState
) =>
  nextState
    .getIn(action[actions.actionMetaProperty].keyPath)
    .getIn([propNames.metadata, 'timestamp'])
```

## `atCursor(cursor, action)`

Sets the action's metadata to reflect the element (cursor) at which the action was fired.

### Usage

```javascript
import { actions } from '@skele/classic'

const middleware = store => next => async action => {
  const result = next(action)

  if (action.type === actions.types.read.apply) {
    store.dispatch(
      actions.atCursor(store.getState(), {
        type: '.showNotification',
      })
    )
  }

  return result
}
```

## `readRefresh([uri])`

Returns an action that refreshes the read.

```javascript
import React from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { actions } from '@skele/classic'

export default class extends React.Component {
  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => this.props.dispatch(actions.readRefresh())}
          />
        }
      />
    )
  }
}
```
