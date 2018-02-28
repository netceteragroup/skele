'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { read as readAction } from '../../read/actions'

export default class Read extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    kind: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]).isRequired,
    uri: PropTypes.string.isRequired,
    revalidate: PropTypes.bool,
    readMeta: PropTypes.object,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { dispatch, uri, revalidate, readMeta } = this.props
    dispatch(readAction(uri, { revalidate, readMeta }))
  }

  render() {
    return null
  }
}
