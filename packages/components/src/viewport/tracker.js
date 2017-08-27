'use strict';

import React from 'react';
import { findNodeHandle } from 'react-native';

export default class ViewportTracker extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.listeners = [];
    this.state = {
      viewportOffset: 0,
      viewportHeight: 0,
    };
  }

  getChildContext() {
    return {
      addViewportListener: this._addListener,
      removeViewportListener: this._removeListener,
    };
  }

  _addListener = (callback) => {
    if (this.listeners.indexOf(callback) === -1) {
      this.listeners = [...this.listeners, callback];
    }
  };

  _removeListener = (callback) => {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      let listeners = [...this.listeners];
      listeners.splice(index, 1);
      this.listeners = listeners;
    }
  };

  _notifyListeners = () => {
    this.listeners.forEach(callback => {
      callback(this.nodeHandle, this.state.viewportOffset, this.state.viewportHeight);
    });
  };

  _onScroll = (event) => {
    const childOnScroll = React.Children.only(this.props.children).props.onScroll;
    childOnScroll && childOnScroll(event);
    const viewportOffset = event.nativeEvent.contentOffset.y;
    this.setState({
      viewportOffset,
    }, this._notifyListeners);
  };

  _onLayout = (event) => {
    const childOnLayout = React.Children.only(this.props.children).props.onLayout;
    childOnLayout && childOnLayout(event);
    const viewportHeight = event.nativeEvent.layout.height;
    this.setState({
      viewportHeight,
    }, this._notifyListeners);
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
  };

  static childContextTypes = {
    addViewportListener: React.PropTypes.func,
    removeViewportListener: React.PropTypes.func,
  };
}