# Components 

Girders Element's `components` package is a library of custom components that aid in building React Native apps.

## Available Components

### Viewport Tracker

Tracks the position and size of a `ScrollView` or `ListView` viewport. Communicates it to all `ViewportAware` child components.

#### Usage

```javascript
import { ViewportTracker } from '@girders-elements/components';
  
render() {
  return (
    <ViewportTracker>
      <ScrollView>
        { this.props.children }
      </ScrollView>
    </ViewportTracker>
  );
}
```

### Viewport Aware

A higher-order component that processes the information communicated by the `ViewportTracker`. Determines whether the wrapped component is in or outside the viewport. Accordingly updates the `inViewport` parameter of the wrapped component.

#### Usage

```javascript
import { Image } from 'react-native';
import { ViewportAware } from '@girders-elements/components';
const ViewportAwareImage = ViewportAware(Image);
  
render() {
  return (
    <ViewportAwareImage
      source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
      preTriggerRatio={0.5} />
  );
}
```

#### Properties

| Prop | Description | Default |
|---|---|---|
|**`preTriggerRatio`**| Determines pre-triggering of `inViewport`. Useful for rendering components beforehand to improve user experience. A ratio of `0.5` means that the effective viewport will be twice the size of the real viewport. | `0` |

### With Placeholder

A higher-order component that can be used to display a placeholder while the component is not in the viewport. This can improve performance and memory management.

#### Usage

```javascript
import { Image } from 'react-native';
import { ViewportAware, WithPlaceholder } from '@girders-elements/components';
const ViewportAwareImageWithPlaceholder = ViewportAware(WithPlaceholder(Image));
  
render() {
  return (
    <ViewportAwareImageWithPlaceholder
      source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
      preTriggerRatio={0.5}
      style={{width: 50, height: 50}}
      placeholderStyle={{ width: 50, height: 50, backgroundColor: 'darkgrey' }} />
  );
}
```

#### Properties

| Prop | Description | Default |
|---|---|---|
|**`placeholderStyle`**| Determines the style of the placeholder. | None |