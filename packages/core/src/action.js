'use strict'

import * as R from 'ramda'
import { kindOf } from './data'

export const actionMetaProperty = '@@girders-elements/_actionMeta'

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
  const kind = kindOf(cursor)

  return { ...action, [actionMetaProperty]: { keyPath, kind } }
})
