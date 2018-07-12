'use strict'

import React from 'react'
import PropTypes from 'prop-types'

export default (WrappedComponent, PlaceholderComponent) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context)
    }

    componentDidUpdate() {
      if (this.props.inViewport && !this._hasEnteredViewport) {
        this._hasEnteredViewport = true
      }
    }

    render() {
      if (this.props.inViewport) {
        return <WrappedComponent {...this.props} />
      }

      if (this.props.retainOnceInViewport && this._hasEnteredViewport) {
        return <WrappedComponent {...this.props} />
      }

      return this.props.placeholder ? (
        <this.props.placeholder />
      ) : PlaceholderComponent ? (
        <PlaceholderComponent />
      ) : null
    }

    static propTypes = {
      inViewport: PropTypes.bool.isRequired,
      placeholder: PropTypes.func,
      retainOnceInViewport: PropTypes.bool,
    }

    static displayName = `WithPlaceholder(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`
  }
}
