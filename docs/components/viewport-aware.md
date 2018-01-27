# Viewport Aware

A higher-order component that processes the information communicated by the viewport tracker. Determines whether the wrapped component is in or outside the viewport. Updates the `inViewport` parameter of the wrapped component accordingly.

## Usage

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

## Properties

| Prop | Description | Default |
|---|---|---|
|**`preTriggerRatio`**| Determines pre-triggering of `inViewport`. Useful for rendering components beforehand to improve user experience. A ratio of `0.5` means that the effective viewport will be twice the size of the real viewport. | `0` |
