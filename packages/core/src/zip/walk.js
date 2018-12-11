'use strict'

import R from 'ramda'
import * as zip from '.'

const _postwalk = (f, zipper) => _walk(_postwalk.bind(undefined, f), f, zipper)

const _prewalk = (f, zipper) =>
  _walk(_prewalk.bind(undefined, f), a => a, zip.edit(f, zipper))

function _walk(inner, outer, zipper) {
  if (zip.canGoDown(zipper)) {
    let current = inner(zip.down(zipper))
    while (zip.canGoRight(current)) {
      current = inner(zip.right(current))
    }
    return zip.edit(outer, zip.up(current))
  } else {
    return zip.edit(outer, zipper)
  }
}

export const postWalk = R.curry(_postwalk)
export const preWalk = R.curry(_prewalk)
