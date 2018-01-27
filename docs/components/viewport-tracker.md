# Viewport Tracker

Tracks the position and size of a `ScrollView` or `ListView` viewport. Communicates it to all viewport aware child components.

## Usage

```javascript
import { Viewport } from '@girders-elements/components';

render() {
  return (
    <Viewport.Tracker>
      <ScrollView>
        { this.props.children }
      </ScrollView>
    </Viewport.Tracker>
  );
}
```
