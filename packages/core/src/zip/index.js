'use strict'

import { onPre, onPost, visit } from '../vendor/zippa'

export * from '../vendor/zippa'

export { default as elementZipper } from './elementZipper'

const preReducingVisitor = fn =>
  onPre((item, state) => ({ state: fn(state, item) }))
const postReductingVisitor = fn =>
  onPost((item, state) => ({ state: fn(state, item) }))

export const preReduce = (fn, initialAcc, zipper) =>
  visit([preReducingVisitor(fn)], initialAcc, zipper).state
export const postReduce = (fn, initialAcc, zipper) =>
  visit([postReductingVisitor(fn)], initialAcc, zipper).state
