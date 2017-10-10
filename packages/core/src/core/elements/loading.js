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
  }

  constructor(props) {
    super(props)
  }

  render() {
    return <ActivityIndicator />
  }
}
