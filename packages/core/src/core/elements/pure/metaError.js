'use strict'

import React from 'react'
import PropTypes from 'prop-types'

function MetaError({ url, status, message }) {
  return (
    <div>
      <p>Read Error</p>
      <p>{url}</p>
      <p>{status}</p>
      <p>{message}</p>
    </div>
  )
}

MetaError.propTypes = {
  url: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
}

export default MetaError
