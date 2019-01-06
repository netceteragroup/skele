'use strict'

import * as I from 'immutable'
import * as zip from './impl'

// Selector fns
// - A selector fn has the signature: (...args, loc) => Iterable(Location)
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return an iterable of locations that have been selected by its execution

// ancestors :: Location -> Iterable(Location)
export const ancestors = loc => I.Seq(_ancestors(loc))

const _ancestors = function*(loc) {
  let currentLoc = loc
  while ((currentLoc = zip.up(currentLoc)) != null) {
    yield currentLoc
  }
}

// descendants :: Location -> Iterable(Location)
export const descendants = loc => I.Seq(_descendants(loc))

const _descendants = function*(loc) {
  let current = null
  if ((current = zip.down(loc)) != null) {
    yield* _descendants(current)
    yield current
  }
  if ((current = zip.right(loc)) != null) {
    yield* _descendants(current)
    yield current
  }
}
