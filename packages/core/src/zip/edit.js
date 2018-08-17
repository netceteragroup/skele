'use strict'

import * as R from 'ramda'
import { isOfKind } from '../data'
import { postWalk } from '../zip'

export const editCond = R.curry((patterns, zipper) =>
  postWalk(el => {
    patterns.forEach(pattern => {
      const pred = pattern[0]
      const updateFn = pattern[1]
      if (
        (typeof pred === 'function' && pred(el)) ||
        (typeof pred !== 'function' && isOfKind(pred, el))
      ) {
        el = updateFn(el)
      }
    })
    return el
  }, zipper)
)
