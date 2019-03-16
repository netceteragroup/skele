'use strict'

import * as R from 'ramda'
import { data } from '@skele/core'

export const actionMetaProperty = '@@skele/actionMeta'

/**
 * gets the action meadata from the action
 */
export const actionMeta = R.prop(actionMetaProperty)

/**
 * Sets the action's metadata to reflect the element (cursor) at which the
 * the action was fired.
 */
export const atCursor = R.curry((cursor, action) => {
  const keyPath = cursor._keyPath
  const kind = data.kindOf(cursor)

  return {
    ...action,
    [actionMetaProperty]: { ...actionMeta(action), keyPath, kind },
  }
})
