'use strict'

import * as R from 'ramda'

import invariant from 'invariant'
import { warning } from '../impl/log'

import * as data from '../data'
import * as actions from '../action'

import { findParentEntry } from '../impl/cursor'

import { ActionRegistry } from '../registry'
/**
 * Main application reducer.
 *
 * @param config A configuration object passed from the Engine component
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export const reducer = R.curry((config, cursor, action) => {
  // skip actions that are not for us
  if (!isApplicable(action)) return cursor

  invariant(
    cursor != null && cursor._keyPath != null,
    'The reducer is meant to work only with cursors'
  )

  const { keyPath: fromPath } = actions.actionMeta(action)
  const type = action.type
  const { registry } = config

  let result = cursor
  let affectedKeyPath

  // handle global updates
  if (type.startsWith('.')) {
    const keyFn = el => ActionRegistry.keyFor(data.kindOf(el), type)

    const entry = findParentEntry(registry, keyFn, cursor.getIn(fromPath))
    if (entry != null) {
      const { element, entry: update } = entry

      result = cursor.setIn(element._keyPath, update(element.deref(), action))
      affectedKeyPath = element._keyPath
    }
  } else {
    // handle local updates
    const key = ActionRegistry.keyFromAction(action)
    const update = registry.get(key)
    const element = cursor.getIn(fromPath)
    if (element) {
      if (update) {
        result = cursor.setIn(fromPath, update(element.deref(), action))
        affectedKeyPath = element._keyPath
      }
    } else {
      warning(
        'Unable to perform local update, element has changed in meantime...'
      )
    }
  }

  // a bit of an ugly hack to remember the which key path was affected
  // with the last update
  if (affectedKeyPath != null) {
    config.lastAffectedKeyPath = affectedKeyPath
  } else {
    confgi.lastAffectedKeyPath = null
  }

  return result
})

const isApplicable = R.pipe(
  actions.actionMeta,
  R.complement(R.isNil)
)
