# Girders Elements Components

Girders Elements' `components` package is a library of custom components that aid in building React and React Native apps.

## Available Components

### Viewport Tracker

Tracks the position and size of a `ScrollView` or `ListView` viewport. Communicates it to all viewport aware child components.

#### Usage

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

### Viewport Aware

A higher-order component that processes the information communicated by the viewport tracker. Determines whether the wrapped component is in or outside the viewport. Updates the `inViewport` parameter of the wrapped component accordingly.

#### Usage

```javascript
import { Image } from 'react-native';
import { Viewport } from '@girders-elements/components';
const ViewportAwareImage = Viewport.Aware(Image);

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

### With Place Holder

A higher-order component that can be used to display a place holder while the component is not in the viewport. This can improve user experience.

#### Usage

```javascript
import { Image, View } from 'react-native';
import { Viewport } from '@girders-elements/components';

const PlaceHolder = () => <View style={{ width: 50, height: 50, backgroundColor: 'darkgrey' }} />

const ViewportAwareImageWithPlaceholder = Viewport.Aware(Viewport.WithPlaceHolder(Image, PlaceHolder));

render() {
  return (
    <ViewportAwareImageWithPlaceholder
      source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
      preTriggerRatio={0.5}
      style={{ width: 50, height: 50 }} />
  );
}
```

#### Properties

| Prop | Description | Default |
|---|---|---|
|**`placeHolder`**| Useful for passing down a place holder at render time. | `null` |
