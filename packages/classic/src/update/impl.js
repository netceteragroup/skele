'use strict'

import * as R from 'ramda'
import { Iterable } from 'immutable'

import { log, registry, internal } from '@skele/core'
const { Cursor } = internal
import * as actions from '../action'

import { ActionRegistry, findParentEntry } from '../registry/ActionRegistry'

const { warning } = log
const { memoize } = registry

/**
 * Main application reducer.
 *
 * @param config A configuration object passed from the Engine component
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export const reducer = config => {
  const { registry } = config

  const updateFor = memoize(key => registry.get(key), ActionRegistry.cacheKey)

  return (state, action) => {
    // skip actions that are not for us
    if (!isApplicable(action)) return state

    const { keyPath: fromPath } = actions.actionMeta(action)
    const cursor = Cursor.from(state, fromPath)

    if (cursor == null) {
      warning(
        'Unable to perform local update, element has changed in meantime...'
      )
      return state
    }
    const type = action.type

    // handle global updates
    if (type.startsWith('.')) {
      const entry = findParentEntry(updateFor, type, cursor)
      if (entry != null) {
        const { element, entry: update } = entry
        return state.setIn(element._keyPath, update(element.deref(), action))
      }
      return state
    }

    // handle local updates
    const update = updateFor(ActionRegistry.keyFromAction(action))
    const element = state.getIn(fromPath)
    if (element) {
      if (update) {
        return state.setIn(fromPath, update(element, action))
      } else {
        return state
      }
    } else {
      warning(
        'Unable to perform local update, element has changed in meantime...'
      )
      return state
    }
  }
}

const isApplicable = R.pipe(
  actions.actionMeta,
  R.complement(R.isNil)
)
