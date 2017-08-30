'use strict'

import React from 'react'
import PropTypes from 'prop-types'

export default (PlaceHolderComponent, WrappedComponent) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context)
    }

    render() {
      if (this.props.inViewport) {
        return <WrappedComponent {...this.props} />
      }
      return <PlaceHolderComponent />
    }

    static propTypes = {
      ...WrappedComponent.propTypes,
      inViewport: PropTypes.bool.isRequired,
      placeholderStyle: PropTypes.object,
    }

    static displayName = `WithPlaceholder(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`
  }
}
