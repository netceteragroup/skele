'use strict'

const END = 'END'
const TOP = null
const TOPPATH = {
  left: [],
  right: [],
  parentItems: TOP,
  parentPath: TOP,
  changed: false,
}

export function Zipper(item, path, meta) {
  this.item = item
  this.path = path
  this.meta = meta
}

export function zipperFrom(oldLoc, newItem, path, meta) {
  return new Zipper(newItem, path || oldLoc.path, meta || oldLoc.meta)
}

export const value = zipper => zipper.item

export function makeZipper(_isBranch, _getChildren, _makeItem) {
  function makeConcreteZipper(item) {
    return new Zipper(item, TOPPATH, {
      isBranch: _isBranch,
      getChildren: _getChildren,
      makeItem: _makeItem,
    })
  }

  makeConcreteZipper.from = makeConcreteZipper
  return makeConcreteZipper
}

export function right(zipper) {
  const path = zipper.path

  if (path === END) return zipper
  if (!canGoRight(zipper)) return null

  const item = zipper.item
  const _lefts = path.left || []
  const _rights = path.right || []
  const [rightSibling, ...nextr] = _rights
  const newLeft = [..._lefts, ...[item]]

  return zipperFrom(zipper, rightSibling, {
    ...path,
    left: newLeft,
    right: nextr,
  })
}

const _isBranch = zipper => zipper.meta.isBranch(zipper.item)

export const getChildren = zipper => zipper.meta.getChildren(zipper.item)

export function down(zipper) {
  if (!_isBranch(zipper)) return null

  const item = zipper.item
  const path = zipper.path

  const children = getChildren(zipper)
  const [c, ...cnext] = children

  return zipperFrom(zipper, c, {
    ...path,
    left: [],
    right: cnext,
    parentItems: [path.parentItems, ...[item]],
    parentPath: path,
  })
}

export function up(zipper) {
  const path = zipper.path

  if (path === END || path.parentPath === TOP) return null

  const pnodes = path.parentItems || []
  const pnode = pnodes[pnodes.length - 1]
  if (!path.changed) return zipperFrom(zipper, pnode, path.parentPath)

  const _lefts = path.left || []
  const _rights = path.right || []
  const newParent = zipper.meta.makeItem(pnode, [
    ..._lefts,
    zipper.item,
    ..._rights,
  ])

  return zipperFrom(zipper, newParent, { ...path.parentPath, changed: true })
}

export const canGoRight = zipper =>
  !!zipper && !!zipper.path && !!zipper.path.right && !!zipper.path.right.length

export const hasChildren = zipper =>
  !!zipper.meta && !!zipper.meta.getChildren && !!zipper.meta.getChildren.length

export const canGoDown = zipper =>
  !!zipper && _isBranch(zipper) && hasChildren(zipper)

export function edit(fn, zipper) {
  const item = zipper.item
  const newItem = fn(item)

  if (item === newItem) return zipper

  const newZipper = zipper
  newZipper.item = newItem
  newZipper.path.changed = true

  return newZipper
}
