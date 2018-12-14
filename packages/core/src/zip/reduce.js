'use strict'

import * as R from 'ramda'

import { postWalk, preWalk } from './walk'

export const reduce = R.curry((fn, initialAcc, zipper) => {
  const items = []
  postWalk(el => {
    items.push(el)
    return el
  }, zipper)
  return R.reduce(fn, initialAcc, items)
})

export const reducePre = R.curry((fn, initialAcc, zipper) => {
  const items = []
  preWalk(el => {
    items.push(el)
    return el
  }, zipper)
  return R.reduce(fn, initialAcc, items)
})
