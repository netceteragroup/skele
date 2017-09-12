'use strict'

import React from 'react'
import PropTypes from 'prop-types'

import ActivityIndicator from './pure/activityIndicator'

export default class Loading extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    kind: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    uri: PropTypes.string.isRequired,
    readId: PropTypes.string.isRequired,
    revalidate: PropTypes.bool,
  }

  constructor(props) {
    super(props)
  }

  render() {
    return <ActivityIndicator />
  }
}
