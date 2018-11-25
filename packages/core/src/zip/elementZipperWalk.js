'use strict'

import R from 'ramda'
import * as zip from '../zip'
import * as data from '../data'

const _postwalk = (f, zipper) => {
  return _walk(_postwalk.bind(undefined, f), f, zipper)
}

function _walk(inner, outer, zipper) {
  if (zip.canGoDown(zipper)) {
    let current = inner(zip.down(zipper))
    while (zip.canGoRight(current)) {
      current = inner(zip.right(current))
    }

    // this is pretty much the same :/
    // const parent = current.up()
    // if (data.isExactlyOfKind('@@skele/child-collection', parent.value())) {
    //   return parent
    // }
    // return zip.edit(outer, parent)
    return zip.edit(outer, current.up())
  } else {
    return zip.edit(outer, zipper)
  }
}

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

export const postWalk = R.curry(_postwalk)
