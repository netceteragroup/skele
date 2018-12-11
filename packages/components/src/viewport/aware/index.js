'use strict'

import React from 'react'
import { UIManager, findNodeHandle } from 'react-native'
import PropTypes from 'prop-types'
import * as Utils from '../utils'

export default WrappedComponent => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context)
      this.state = {
        componentOffset: null,
        componentHeight: null,
        inViewport: false,
      }
    }

    componentDidMount() {
      this.context.addViewportListener &&
        this.context.addViewportListener(this._onViewportChange)
      this._isMounted = true
      this._lastInfo &&
        setTimeout(() => this._onViewportChange(this._lastInfo), 50)
    }

    componentWillUnmount() {
      this.context.removeViewportListener &&
        this.context.removeViewportListener(this._onViewportChange)
      this._isMounted = false
    }

    _onViewportChange = info => {
      this._lastInfo = info
      if (!this.nodeHandle) return
      if (
        info.shouldMeasureLayout ||
        this.state.componentOffset == null ||
        this.state.componentHeight == null
      ) {
        if (!this._isMounted) return
        UIManager.measureLayout(
          this.nodeHandle,
          info.parentHandle,
          () => {},
          (offsetX, offsetY, width, height) => {
            if (!this._isMounted) return
            const inViewport = Utils.isInViewport(
              info.viewportOffset,
              info.viewportHeight,
              offsetY,
              height,
              this.props.preTriggerRatio
            )
            this._checkViewportEnterOrLeave(inViewport)
            this.setState({
              componentOffset: offsetY,
              componentHeight: height,
              inViewport,
            })
          }
        )
      } else {
        const inViewport = Utils.isInViewport(
          info.viewportOffset,
          info.viewportHeight,
          this.state.componentOffset,
          this.state.componentHeight,
          this.props.preTriggerRatio
        )
        if (this._checkViewportEnterOrLeave(inViewport)) {
          this.setState({ inViewport })
        }
      }
    }

    _checkViewportEnterOrLeave = inViewport => {
      if (!this.state.inViewport && inViewport) {
        this.props.onViewportEnter && this.props.onViewportEnter()
        return true
      } else if (this.state.inViewport && !inViewport) {
        this.props.onViewportLeave && this.props.onViewportLeave()
        return true
      }
      return false
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          inViewport={this.state.inViewport}
          ref={ref => {
            this.nodeHandle = findNodeHandle(ref)
            this.props.innerRef && this.props.innerRef(ref)
          }}
        />
      )
    }

    static propTypes = {
      preTriggerRatio: PropTypes.number,
      onViewportEnter: PropTypes.func,
      onViewportLeave: PropTypes.func,
      innerRef: PropTypes.func,
    }

    static contextTypes = {
      addViewportListener: PropTypes.func,
      removeViewportListener: PropTypes.func,
    }

    static displayName = `ViewportAware(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`
  }
}
