'use strict'

import * as vendor from '../vendor/zippa/zipper'

const END = 'END'
const TOP = null;

/**
 * Moves location to the right sibling.
 * If the current location is already the rightmost,
 * returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */
export function right(zipper) {
  const path = zipper.path

  if (path === END) return zipper
  if (!path.right || !path.right.length) return null

  const item = zipper.item
  const _lefts = path.left || []
  const _rights = path.right || []
  const [rightSibling, ...nextr] = _rights
  const newLeft = [..._lefts, ...[item]]

  return new vendor.Zipper(rightSibling, {...path, left: newLeft, right: nextr}, zipper.meta);
}

/**
 * Moves location to the leftmost child.
 * If the current item is a leaf, returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */

export function down(zipper) {
  if (zipper && !!zipper.meta && !!zipper.meta.item) return null

  const item = zipper.item
  const path = zipper.path

  const children = zipper.meta.getChildren(zipper.item)
  const [c, ...cnext] = children

  return new vendor.Zipper(c, {
      ...path,
      left: [],
      right: cnext,
      parentItems: [path.parentItems, ...[item]],
      parentPath: path,
    },
    zipper.meta
  )
}


/**
 * Moves location to the parent, constructing a new parent
 * if the children have changed.
 *
 * If already at the top, returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */
export function up(zipper) {
  const path = zipper.path

  if (path === END || path.parentPath === TOP) return null

  const pnodes = path.parentItems
  const pnode = pnodes.slice(-1)

  if (!path.changed) return new vendor.Zipper(pnode, path.parentPath, zipper.meta)

  const _lefts = path.left || []
  const _rights = path.right || []
  const newParent = zipper.meta.makeItem(zipper, pnode, [..._lefts, ..._rights])

  return new vendor.Zipper(newParent, {...path.parentPath, changed: true}, zipper.meta)
}
