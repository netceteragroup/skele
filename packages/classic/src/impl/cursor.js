'use strict'

import * as R from 'ramda'
import { List, Seq } from 'immutable'
import Cursor from 'immutable/contrib/cursor'

import { data } from '@skele/core'

export const findParentEntry = R.curry((registry, keyfn, cursor) =>
  data.flow(
    cursor,
    parents,
    ps => ps.filter(data.isElement),
    ps => ps.map(entry(registry, keyfn)),
    ps => ps.filterNot(R.isNil),
    ps => ps.first()
  )
)

const entry = R.curry((registry, keyfn, cursor) =>
  data.flow(
    cursor,
    c => registry.get(keyfn(c)),
    R.when(R.complement(R.isNil), en => ({ element: cursor, entry: en }))
  )
)

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
