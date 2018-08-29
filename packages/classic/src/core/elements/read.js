'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { read as readAction } from '../../read/actions'

export default class Read extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uri: PropTypes.string.isRequired,
    opts: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { dispatch, uri, opts } = this.props
    dispatch(readAction(uri, opts))
  }

  render() {
    return null
  }
}
