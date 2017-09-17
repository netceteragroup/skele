'use strict'

import React from 'react'

import MetaError from './pure/metaError'
import * as propNames from '../../propNames'

export default ({ element }) => {
  const meta = element.get(propNames.metadata)
  let message = meta.get('message')
  if (typeof message === 'object') {
    message = message.toString()
  }
  return (
    <MetaError
      url={meta.get('url')}
      status={meta.get('status')}
      message={message}
    />
  )
}
