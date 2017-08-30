'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { findNodeHandle } from 'react-native'

import WithEvents from '../../shared/WithEvents'

export default class ViewportTracker extends WithEvents(
  { name: 'viewport', inChildContext: true },
  React.Component
) {
  constructor(props, context) {
    super(props, context)
    this._viewportHeight = 0
    this._viewportOffset = 0
  }

  _onScroll = event => {
    const childOnScroll = React.Children.only(this.props.children).props
      .onScroll
    childOnScroll && childOnScroll(event)
    this._viewportOffset = event.nativeEvent.contentOffset.y

    this._onViewportChange()
  }

  _onLayout = event => {
    const childOnLayout = React.Children.only(this.props.children).props
      .onLayout
    childOnLayout && childOnLayout(event)
    this._viewportHeight = event.nativeEvent.layout.height
    this._onViewportChange()
  }

  _onViewportChange = () => {
    this.notifyViewportListeners({
      parentHandle: this.nodeHandle,
      viewportOffset: this._viewportOffset,
      viewportHeight: this._viewportHeight,
    })
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children), {
      onScroll: this._onScroll,
      onLayout: this._onLayout,
      ref: ref => (this.nodeHandle = findNodeHandle(ref)),
    })
  }

  static propTypes = {
    children: PropTypes.element.isRequired,
  }
}
