'use strict'

import { onPre, onPost, visit } from '../vendor/zippa'

const reduceVisitor = fn => (item, state) => ({ state: fn(state, item) })

export const reduce = (fn, initialAcc, zipper) =>
  visit([onPost(reduceVisitor(fn))], initialAcc, zipper).state

export const reducePre = (fn, initialAcc, zipper) =>
  visit([onPre(reduceVisitor(fn))], initialAcc, zipper).state
