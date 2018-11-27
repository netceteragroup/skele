'use strict'

import R from 'ramda'
import * as zip from '.'

const _postwalk = (f, zipper) => _walk(_postwalk.bind(undefined, f), f, zipper)

// const _prewalk = (f, zipper) =>
//   _walk(_prewalk.bind(undefined, f), a => a, f(zipper))

function _walk(inner, outer, zipper) {
  if (zip.canGoDown(zipper)) {
    let current = inner(zip.down(zipper))
    while (zip.canGoRight(current)) {
      current = inner(zip.right(current))
    }
    return zip.edit(outer, current.up())
  } else {
    return zip.edit(outer, zipper)
  }
}

/** 
 * Alternative implementation, used for comparison in perf tests.
/*
function _walkWithReplace(inner, outer, zipper) {
  if (zip.canGoDown(zipper)) {
    const first = zip.down(zipper)
    const rest = []
    let current = first
    let canGoRight = zip.canGoRight(current)
    while (canGoRight) {
      current = current.right()
      rest.push(current)
      canGoRight = zip.canGoRight(current)
    }
    const children = [first, ...rest]

    const changedChildren = children.map(inner)
    const changedValue = zip.makeItem(
      zipper,
      zip.value(zipper),
      R.map(zip.value, changedChildren)
    )
    return zip.replace(changedValue, zipper)
  } else {
    return zip.edit(outer, zipper)
  }
}
*/

export const postWalk = R.curry(_postwalk)
// export const preWalk = R.curry(_prewalk)
