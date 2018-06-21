'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { findNodeHandle } from 'react-native'

import WithEvents from '../../shared/WithEvents'

export default class ViewportTracker extends WithEvents(
  { name: 'viewport', inChildContext: true, notifiesWithLastEventOnAdd: true },
  React.Component
) {
  constructor(props, context) {
    super(props, context)
    this._viewportHeight = 0
    this._viewportOffset = 0
  }

  _onRef = ref => {
    const childOnRef = React.Children.only(this.props.children).ref
    childOnRef && typeof childOnRef === 'function' && childOnRef(ref)
    this.nodeHandle = findNodeHandle(ref)
  }

  _onLayout = event => {
    const childOnLayout = React.Children.only(this.props.children).props
      .onLayout
    childOnLayout && childOnLayout(event)
    this._viewportHeight = event.nativeEvent.layout.height
    this._onViewportChange()
  }

  _onContentSizeChange = (contentWidth, contentHeight) => {
    const childOnContentSizeChange = React.Children.only(this.props.children)
      .props.onContentSizeChange
    childOnContentSizeChange &&
      childOnContentSizeChange(contentWidth, contentHeight)
    this._onViewportChange()
  }

  _onScroll = event => {
    const childOnScroll = React.Children.only(this.props.children).props
      .onScroll
    childOnScroll && childOnScroll(event)
    this._viewportOffset = event.nativeEvent.contentOffset.y
    this._onViewportChange(false)
  }

  _onViewportChange = (shouldMeasureLayout = true) => {
    this.nodeHandle &&
      this._viewportHeight > 0 &&
      this.notifyViewportListeners({
        parentHandle: this.nodeHandle,
        viewportOffset: this._viewportOffset,
        viewportHeight: this._viewportHeight,
        shouldMeasureLayout,
      })
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children), {
      ref: this._onRef,
      onLayout: this._onLayout,
      onContentSizeChange: this._onContentSizeChange,
      onScroll: this._onScroll,
    })
  }

  static propTypes = {
    children: PropTypes.element.isRequired,
  }
}
