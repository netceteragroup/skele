'use strict'

import * as vendor from '../vendor/zippa/zipper'

const END = 'END'

export function right(zipper) {
  const path = zipper.path

  if (path === END) return zipper
  if (!path.right || !path.right.length) return null

  const item = zipper.item
  const _lefts = path.left || []
  const _rights = path.right || []
  const [rightSibling, ...nextr] = _rights
  const newLeft = [..._lefts, ...[item]]
  const newRight = nextr.slice(-1)

  return vendor.zipperFrom(zipper, rightSibling, {
    ...path,
    left: newLeft,
    right: newRight,
  })
}
