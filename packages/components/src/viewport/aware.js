'use strict';

import React from 'react';
import { View } from 'react-native';
import * as Utils from './utils'

export default WrappedComponent => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {
        mounted: false,
        inViewport: false,
      };
    }

    componentDidMount() {
      this.context.addViewportListener
        && this.context.addViewportListener(this._onViewportChange);
      this.setState({
        mounted: true,
      });
    }

    componentWillUnmount() {
      this.context.removeViewportListener
        && this.context.removeViewportListener(this._onViewportChange);
    }

    _onViewportChange = (parentHandle, viewportOffset, viewportHeight) => {
      if (this.state.mounted) {
        this.wrapperRef.measureLayout(parentHandle, (wrapperX, wrapperY, wrapperWidth, wrapperHeight) => {
          const inViewport = Utils.isInViewport(
            viewportOffset, viewportHeight, wrapperY, wrapperHeight, this.props.preTriggerRatio);
          this.setState({
            inViewport,
          });
        });
      }
    };

    render() {
      return (
        <View ref={ref => this.wrapperRef = ref}>
          <WrappedComponent
            {...this.props}
            inViewport={this.state.inViewport} />
        </View>
      );
    }

    static propTypes = {
      preTriggerRatio: React.PropTypes.number,
    };

    static contextTypes = {
      addViewportListener: React.PropTypes.func,
      removeViewportListener: React.PropTypes.func,
    };

    static displayName =
      `ViewportAware(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  };
};