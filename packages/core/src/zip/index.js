'use strict'

import { visit, onPre } from '../vendor/zippa'

export * from '../vendor/zippa'

export { default as elementZipper } from './elementZipper'

const reducingVisitor = fn =>
  onPre((item, state) => ({ state: fn(state, item) }))

export const when = (pred, fn) => (acc, i) => (pred(i) ? fn(acc, i) : acc)

export const reduceZipper = (fn, initialAcc, zipper) =>
  visit([reducingVisitor(fn)], initialAcc, zipper).state
