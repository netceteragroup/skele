'use strict'

import * as vendor from '../vendor/zippa/zipper'

const END = 'END'
const TOP = null

export function right(zipper) {
  const path = zipper.path

  if (path === END) return zipper
  // if (!path.right || !path.right.length) return null

  const item = zipper.item
  const _lefts = path.left || []
  const _rights = path.right || []
  const [rightSibling, ...nextr] = _rights
  const newLeft = [..._lefts, ...[item]]

  return vendor.zipperFrom(zipper, rightSibling, {
    ...path,
    left: newLeft,
    right: nextr,
  })
}

export const isBranch = zipper => zipper.meta.isBranch(zipper.item)

export function down(zipper) {
  // if (!isBranch) return null

  const item = zipper.item
  const path = zipper.path

  const children = zipper.meta.getChildren(zipper.item)
  const [c, ...cnext] = children

  return new vendor.Zipper(
    c,
    {
      ...path,
      left: [],
      right: cnext,
      parentItems: [path.parentItems, ...[item]],
      parentPath: path,
    },
    zipper.meta
  )
}

export function up(zipper) {
  const path = zipper.path

  if (path === END || path.parentPath === TOP) return null

  const pnodes = path.parentItems || []
  const pnode = pnodes[pnodes.length - 1]
  if (!path.changed)
    return new vendor.Zipper(pnode, path.parentPath, zipper.meta)

  const _lefts = path.left || []
  const _rights = path.right || []
  const newParent = zipper.meta.makeItem(pnode, [
    ..._lefts,
    zipper.item,
    ..._rights,
  ])

  return new vendor.Zipper(
    newParent,
    { ...path.parentPath, changed: true },
    zipper.meta
  )
}

export const canGoRight = zipper =>
  !!zipper.path && !!zipper.path.right && !!zipper.path.right.length

export const hasChildren = zipper =>
  !!zipper.meta && !!zipper.meta.getChildren && !!zipper.meta.getChildren.length

export const canGoDown = zipper => isBranch(zipper) && hasChildren(zipper)

export function edit(fn, zipper) {
  const item = zipper.item
  const newItem = fn(item)

  if (item === newItem) return zipper

  const newZipper = zipper
  newZipper.item = newItem
  newZipper.path.changed = true

  return newZipper
}
