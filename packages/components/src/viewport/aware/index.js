'use strict'

import React from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import * as Utils from '../utils'

export default WrappedComponent => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context)
      this.state = {
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
      if (this.wrapperRef != null) {
        this.wrapperRef.measureLayout(
          info.parentHandle,
          (wrapperX, wrapperY, wrapperWidth, wrapperHeight) => {
            const inViewport = Utils.isInViewport(
              info.viewportOffset,
              info.viewportHeight,
              wrapperY,
              wrapperHeight,
              this.props.preTriggerRatio
            )
            this.setState({
              inViewport,
            })
          }
        )
      }
    }

    render() {
      return (
        <View ref={ref => (this.wrapperRef = ref)}>
          <WrappedComponent
            {...this.props}
            inViewport={this.state.inViewport}
          />
        </View>
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
