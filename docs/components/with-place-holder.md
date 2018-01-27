# With Place Holder

A higher-order component that can be used to display a place holder while the component is not in the viewport. This can improve user experience.

## Usage

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

## Properties

| Prop | Description | Default |
|---|---|---|
|**`placeHolder`**| Useful for passing down a place holder at render time. | `null` |
