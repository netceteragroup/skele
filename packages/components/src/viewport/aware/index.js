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
    }

    componentWillUnmount() {
      this.context.removeViewportListener &&
        this.context.removeViewportListener(this._onViewportChange)
    }

    _onViewportChange = info => {
      if (this.nodeHandle) {
        if (this.state.componentOffset && this.state.componentHeight) {
          this.setState({
            inViewport: Utils.isInViewport(
              info.viewportOffset,
              info.viewportHeight,
              this.state.componentOffset,
              this.state.componentHeight,
              this.props.preTriggerRatio
            ),
          })
        } else {
          UIManager.measureLayout(
            this.nodeHandle,
            info.parentHandle,
            () => {},
            (offsetX, offsetY, width, height) => {
              this.setState({
                componentOffset: offsetY,
                componentHeight: height,
                inViewport: Utils.isInViewport(
                  info.viewportOffset,
                  info.viewportHeight,
                  offsetY,
                  height,
                  this.props.preTriggerRatio
                ),
              })
            }
          )
        }
      }
    }

    render() {
      return (
        <WrappedComponent
          ref={ref => (this.nodeHandle = findNodeHandle(ref))}
          {...this.props}
          inViewport={this.state.inViewport}
        />
      )
    }

    static propTypes = {
      preTriggerRatio: PropTypes.number,
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
