'use strict'

import React from 'react'
import PropTypes from 'prop-types'

import { Text, View } from 'react-native'

function MetaError({ url, status, message }) {
  return (
    <View>
      <Text>Read Error</Text>
      <Text>{url}</Text>
      <Text>{status}</Text>
      <Text>{message}</Text>
    </View>
  )
}

MetaError.propTypes = {
  url: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
}

export default MetaError
