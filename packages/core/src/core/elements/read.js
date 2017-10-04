'use strict'

import React from 'react'
import PropTypes from 'prop-types'

export default class Read extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    kind: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    uri: PropTypes.string.isRequired,
    revalidate: PropTypes.bool,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { dispatch, kind, uri, revalidate } = this.props
    dispatch({ type: 'READ', uri, kind, revalidate })
  }

  render() {
    return null
  }
}
