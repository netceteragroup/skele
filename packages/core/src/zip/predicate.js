'use strict'

import I from 'immutable'
import R from 'ramda'

import * as zip from './impl'

import { isOfKind, flow } from '../data'

const isImm = I.Iterable.isIterable
const areImm = (...vals) =>
  flow(
    vals,
    R.all(isImm)
  )

// Predicate fns
// - A predicate fn has the signature: (...args, loc) => boolean
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return a bool indicating if the location should be filtered or not

export const propEq = R.curry((key, value, loc) => {
  const valueFromLoc = zip.node(loc).get(key)
  if (areImm(value, valueFromLoc)) {
    return value.equals(valueFromLoc)
  } else {
    return R.equals(value, valueFromLoc)
  }
})

export const ofKind = R.curry((kind, loc) => isOfKind(kind, zip.node(loc)))
