'use strict'

import R from 'ramda'

import invariant from 'invariant'
import warning from '../impl/warning'

import { Seq, List } from 'immutable'
import Cursor from 'immutable/contrib/cursor'

import { Registry } from '../registry'
import * as data from '../data'
import * as actions from '../action'
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

  // handle global updates
  if (type.startsWith('.')) {
    const resultFromLookup = parents(cursor.getIn(fromPath))
      .filter(parent => !!parent.get('kind'))
      .map(parent => {
        const parentKind = data.kindOf(parent)
        const updatesPerAncestor = data
          .ancestorKinds(parentKind)
          .map(ancestorKind => registry.get(updateKey(ancestorKind, type)))
          .filter(update => !!update)
        return {
          element: parent,
          update: updatesPerAncestor.first(),
        }
      })
      .filter(parent => !!parent.update)
      .first()

    if (resultFromLookup) {
      const { element, update } = resultFromLookup
      if (element && update) {
        return cursor.setIn(element._keyPath, update(element.deref(), action))
      }
    }
    return cursor
  }

  // handle local updates
  const update = registry.get(updateKeyForAction(action))
  const element = cursor.getIn(fromPath)
  if (element && update) {
    return cursor.setIn(fromPath, update(element.deref(), action))
  } else {
    warning(
      'Unable to perform local update, element has changed in meantime...'
    )
    return cursor
  }

  return cursor
})

export class UpdateRegistry extends Registry {
  _lessSpecificKey(key) {
    if (key != null) {
      const kind = key.get(0)
      const lessSpecific = super._lessSpecificKey(kind)

      if (lessSpecific != null) {
        return updateKey(lessSpecific, key.get(1))
      }
    }

    return undefined
  }
}

export const updateKey = (kind, action) => List.of(data.canonical(kind), action)
export const updateKeyForAction = ({
  [actions.actionMetaProperty]: { kind },
  type,
}) => updateKey(kind, type)

const isApplicable = R.pipe(actions.actionMeta, R.complement(R.isNil))
/**
 * Gets the parent value of this cursor. returns null if this is the root cursors.
 */
function parent(cursor) {
  if (cursor == null) {
    return null
  }

  const root = cursor._rootData
  const onChange = cursor._onChange
  const keyPath = cursor._keyPath

  if (keyPath.length === 0) {
    return null // root
  }

  const newPath = keyPath.slice(0, -1)

  return Cursor.from(root, newPath, onChange)
}

/**
 * Gets a Seq of all the parents (self first, then parent, ...) of this cursor. The Seq is lazy.
 */
function parents(cursor) {
  if (cursor == null) {
    return List()
  }

  const self = cursor

  function* _ancestors() {
    let current = self

    while (current != null) {
      yield current
      current = parent(current)
    }
  }

  return Seq(_ancestors())
}
