'use strict'

import { curry } from 'ramda'
import { onPre, onPost, visit } from '../vendor/zippa'

const reduceVisitor = fn => (item, state) => ({ state: fn(state, item) })

export const reduce = curry(
  (fn, initialAcc, zipper) =>
    visit([onPost(reduceVisitor(fn))], initialAcc, zipper).state
)

export const reducePre = curry(
  (fn, initialAcc, zipper) =>
    visit([onPre(reduceVisitor(fn))], initialAcc, zipper).state
)
