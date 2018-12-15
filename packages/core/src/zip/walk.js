'use strict'

import R from 'ramda'
import * as zip from './impl'

const _postwalk = (f, zipper) => _walk(_postwalk.bind(undefined, f), f, zipper)

const _prewalk = (f, zipper) =>
  _walk(_prewalk.bind(undefined, f), a => a, zip.edit(f, zipper))

function _walk(inner, outer, loc) {
  let cnext = zip.down(loc)
  if (cnext != null) {
    let c
    do {
      c = cnext
      c = inner(c)
    } while ((cnext = zip.right(c)) != null)
    return zip.edit(outer, zip.up(c))
  } else {
    return zip.edit(outer, loc)
  }
}

export const postWalk = R.curry(_postwalk)
export const preWalk = R.curry(_prewalk)
