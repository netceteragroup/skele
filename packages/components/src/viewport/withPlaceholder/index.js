'use strict';

import React from 'react';
import { View } from 'react-native';

export default WrappedComponent => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
    }

    render() {
      if (this.props.inViewport) {
        return <WrappedComponent {...this.props} />;
      }
      return <View style={this.props.placeholderStyle} />;
    }

    static propTypes = {
      inViewport: React.PropTypes.bool.isRequired,
      placeholderStyle: React.PropTypes.object,
    };

    static displayName =
      `WithPlaceholder(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  };
};