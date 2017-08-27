'use strict';

import React from 'react';
import { findNodeHandle } from 'react-native';

export default class ViewportTracker extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      viewportOffset: 0,
      viewportHeight: 0,
    };
  }

  getChildContext() {
    return {
      addViewportListener: this.props.addListener,
      removeViewportListener: this.props.removeListener,
    };
  }

  _onScroll = (event) => {
    const childOnScroll = React.Children.only(this.props.children).props.onScroll;
    childOnScroll && childOnScroll(event);
    const viewportOffset = event.nativeEvent.contentOffset.y;
    this.setState({
      viewportOffset,
    }, this._onViewportChange);
  };

  _onLayout = (event) => {
    const childOnLayout = React.Children.only(this.props.children).props.onLayout;
    childOnLayout && childOnLayout(event);
    const viewportHeight = event.nativeEvent.layout.height;
    this.setState({
      viewportHeight,
    }, this._onViewportChange);
  };

  _onViewportChange = () => {
    this.props.notifyListeners && this.props.notifyListeners({
      parentHandle: this.nodeHandle,
      viewportOffset: this.state.viewportOffset,
      viewportHeight: this.state.viewportHeight,
    });
  };

  render() {
    return React.cloneElement(
      React.Children.only(this.props.children),
      {
        onScroll: this._onScroll,
        onLayout: this._onLayout,
        ref: ref => this.nodeHandle = findNodeHandle(ref),
      },
    );
  }

  static propTypes = {
    children: React.PropTypes.element.isRequired,
    addListener: React.PropTypes.func.isRequired,
    removeListener: React.PropTypes.func.isRequired,
    notifyListeners: React.PropTypes.func.isRequired,
  };

  static childContextTypes = {
    addViewportListener: React.PropTypes.func,
    removeViewportListener: React.PropTypes.func,
  };
}