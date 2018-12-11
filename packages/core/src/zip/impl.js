'use strict'

import deprecated from '../log/deprecated'

const END = 'END'

// We use the following naming conventions (to keep in sync with original work)
// - loc, short for location, a zipper structure pointing somewhere within the tree
// - node - the (unwrapped) value behind a particular location
// - meta - the metadata (methods) of a particular zipper implementation

/**
 * Creates a new zipper.
 *
 * @param {} isBranch a function that given a node, returns true if it can have children, even
 * if it currently doesn't
 * @param {*} children a fn that, given a branch node, returns an array of it's children
 * @param {*} makeNode a fn that given an existing branch node and an array of children, returns
 * a new branch node incorporating the given children
 * @param {*} root the root structure of the zipper (root node)
 */
export function zipper(isBranch, children, makeNode, root) {
  return { node: root, path: null, meta: { isBranch, children, makeNode } }
}

export const makeZipper = deprecated(
  'Use partial or direct call to zipper() instead',

  function(isBranch, children, makeNode) {
    const z = zipper.bind(undefined, isBranch, children, makeNode)
    z.from = z
    return z
  }
)

/**
 * Returns the node at the given location
 * @param {} loc
 */
export const node = loc => loc.node

export const value = deprecated('use node() instead', node)

/**
 * Returns true if the node at loc is a a branch
 * @param {*} loc a location
 */
export const isBranch = loc => loc.meta.isBranch(loc.node)

/**
 * Returns an array of the node's children. Throws in case the locations is not a branch node.
 * @param {*} loc
 */
export const children = loc => {
  if (isBranch(loc)) {
    return loc.meta.children(loc.node)
  }
  throw new Error('called children() on a leaf node')
}

/**
 * Returns a new branch node, given an existing node and new children.
 * The location is only used to provide the node constructor.
 *
 * @param {*} loc
 * @param {*} node
 * @param {*} children
 */
export const makeNode = (loc, node, children) =>
  loc.meta.makeNode(node, children)

/**
 * Given a loc, returns an array of nodes leading to it.
 *
 * @param {*} loc
 */
export const path = loc => loc.path.pnodes

/**
 * Returns an array of the siblings on the left of this loc or null
 * If there are none
 *
 * @param {*} loc
 */
export const lefts = loc =>
  loc.path.l && loc.path.l.length > 0 ? loc.path.l : null

export const rights = loc =>
  loc.path.r && loc.path.r.length > 0 ? loc.path.r : null

export const down = loc => {
  if (isBranch(loc)) {
    const cs = children(loc)
    if (cs && cs.length > 0) {
      const [c, ...cnext] = cs
      return {
        node: c,
        path: {
          l: [],
          r: cnext,
          pnodes: loc.node.path ? [...loc.node.path, loc.node] : [loc.node],
          ppath: loc.path,
        },
        meta: loc.meta,
      }
    }
  }
  return null
}

export const up = loc => {
  const { node, path } = loc

  if (path != null) {
    const { l, r, pnodes, ppath, isChanged } = path

    if (pnodes && pnodes.length > 0) {
      const pnode = pnodes[pnodes.length - 1]
      if (isChanged) {
        return {
          node: makeNode(loc, pnode, [...(l || []), node, ...(r || [])]),
          path: ppath && { ...ppath, isChanged: true },
          meta: loc.meta,
        }
      } else {
        return {
          node: pnode,
          path: ppath,
          meta: loc.meta,
        }
      }
    }
  }

  return null
}

export const root = loc => {
  if (loc.path === END) {
    return node(loc)
  } else {
    const p = up(loc)

    if (p == null) return node(loc)
    return root(p)
  }
}

export const right = loc => {
  const { node, path } = loc

  if (path) {
    const { l, r } = path
    if (r && r.length > 0) {
      return {
        node: r[0],
        path: {
          ...path,
          l: [...(l || []), node],
          r: r.slice(1),
        },
        meta: loc.meta,
      }
    }
  }

  return null
}

export const left = loc => {
  const { node, path } = loc

  if (path) {
    const { l, r } = loc
    if (l && l.length > 0) {
      return {
        node: l[l.length - 1],
        path: {
          ...path,
          l: l.slice(0, -1),
          r: [node, ...(r || [])],
        },
        meta: loc.meta,
      }
    }
  }
}

export const replace = (node, loc) => ({
  ...loc,
  node,
  path: {
    ...(loc.path || {}),
    // small optimization that insures no-op changes are ignored. assumes in-object writing as illegal
    isChanged: (loc.path && loc.path.isChanged) || node !== loc.node,
  },
})

export const edit = (f, loc) => replace(f(node(loc)), loc)

export const getChildren = deprecated('Use children() instead.', children)
