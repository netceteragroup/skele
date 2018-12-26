'use strict'

import { kindOf, flow } from '../data'
import { postWalk } from '../zip'
import * as zip from './impl'
import { curry } from 'ramda'

import Registry from '../registry/Registry'

export const editCond = (patterns, loc) => {
  const kinds = new Registry()
  const preds = []

  patterns.forEach(([pred, f]) => {
    if (typeof pred === 'function') {
      preds.push([pred, f])
    } else {
      kinds.register(pred, f)
    }
  })

  const editFn = l =>
    postWalk(el => {
      const kind = kindOf(el)
      const f = kind != null && kinds.get(kind)

      if (f != null) el = f(el)

      const after = preds.reduce((el, [pred, f]) => (pred(el) ? f(el) : el), el)
      return after
    }, l)

  return typeof loc === 'undefined' ? editFn : editFn(loc)
}

export const editAt = curry((motion, f, loc) => {
  const rootLoc = zip.zipper(
    loc.meta.isBranch,
    loc.meta.children,
    loc.meta.makeNode,
    zip.node(loc)
  )

  return flow(
    rootLoc,
    motion,
    zip.edit.bind(undefined, f),
    zip.root,
    newVal => zip.replace(newVal, loc)
  )
})
