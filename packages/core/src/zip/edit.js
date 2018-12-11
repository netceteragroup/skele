'use strict'

import { kindOf } from '../data'
import { postWalk } from '../zip'
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
