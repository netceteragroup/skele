'use strict'

import * as R from 'ramda'
import { Iterable } from 'immutable'
import invariant from 'invariant'

import { log, registry } from '@skele/core'
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

  const sep = '$$sep$$' // ideally this would be a Symbol but we aren't there yet
  const cacheKeyFn = key => {
    const kind = key.kind
    let res = Iterable.isIndexed(kind)
      ? kind.toArray()
      : Array.isArray(kind) ? kind : [kind]
    res.push(sep, key.action)

    return res
  }
  const updateFor = memoize(key => registry.get(key), cacheKeyFn)

  return (cursor, action) => {
    // skip actions that are not for us
    if (!isApplicable(action)) return cursor

    invariant(
      cursor != null && cursor._keyPath != null,
      'The reducer is meant to work only with cursors'
    )

    const { keyPath: fromPath } = actions.actionMeta(action)
    const type = action.type

    // handle global updates
    if (type.startsWith('.')) {
      const entry = findParentEntry(updateFor, type, cursor.getIn(fromPath))
      if (entry != null) {
        const { element, entry: update } = entry
        return cursor.setIn(element._keyPath, update(element.deref(), action))
      }
      return cursor
    }

    // handle local updates
    const update = updateFor(ActionRegistry.keyFromAction(action))
    const element = cursor.getIn(fromPath)
    if (element) {
      if (update) {
        return cursor.setIn(fromPath, update(element.deref(), action))
      } else {
        return cursor
      }
    } else {
      warning(
        'Unable to perform local update, element has changed in meantime...'
      )
      return cursor
    }

    return cursor
  }
}

const isApplicable = R.pipe(actions.actionMeta, R.complement(R.isNil))
