'use strict'

import React from 'react'
import PropTypes from 'prop-types'

export default (WrappedComponent, PlaceholderComponent) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context)
    }

    render() {
      if (this.props.inViewport) {
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
    }

    static displayName = `WithPlaceholder(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`
  }
}
