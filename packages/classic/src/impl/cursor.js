'use strict'

import { List, Seq } from 'immutable'
import Cursor from 'immutable/contrib/cursor'

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
export function parents(cursor) {
  if (cursor == null) {
    return List()
  }

  return Seq(ancestors())
}

export function* ancestors(cursor) {
  let current = cursor

  while (current != null) {
    yield current
    current = parent(current)
  }
}
