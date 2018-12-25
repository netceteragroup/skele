'use strict'

import * as zip from './impl'

// Selector fns
// - A selector fn has the signature: (...args, loc) => [loc]
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return a an array of locations that have been selected by its execution

// ancestors :: Location -> [Location]
export const ancestors = loc => {
  const result = []
  let currentLoc = loc
  while ((currentLoc = zip.up(currentLoc)) != null) {
    result.push(currentLoc)
  }
  return result
}

// descendants :: Location -> [Location]
export const descendants = loc => _descendants(loc)

const _descendants = (loc, collector = []) => {
  let current = null
  if ((current = zip.down(loc)) != null) {
    _descendants(current, collector)
    collector.push(current)
  }
  if ((current = zip.right(loc)) != null) {
    _descendants(current, collector)
    collector.push(current)
  }
  return collector
}
