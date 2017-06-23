'use strict';

import React from 'react';
import { View } from 'react-native';

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
          const inViewport = this._isInViewport(viewportOffset, viewportHeight, wrapperY, wrapperHeight);
          this.setState({
            inViewport,
          });
        });
      }
    };

    _isInViewport = (viewportOffset, viewportHeight, wrapperOffset, wrapperHeight) => {
      let inViewport = true;
      const preTriggerAreaSize = this.props.preTriggerRatio ?
        this.props.preTriggerRatio * viewportHeight : 0;
      const wrapperEnd = wrapperOffset + wrapperHeight;
      const viewportEnd = viewportOffset + viewportHeight;
      const isViewportOffsetAboveWrapper = viewportOffset <= wrapperOffset;
      if (isViewportOffsetAboveWrapper) {
        inViewport = wrapperOffset - preTriggerAreaSize <= viewportEnd;
      } else {
        inViewport = wrapperEnd + preTriggerAreaSize >= viewportOffset;
      }
      return inViewport;
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