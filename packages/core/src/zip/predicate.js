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

// propEq :: (String, Any) -> Location -> Boolean
export const propEq = R.curry((key, value, loc) => {
  const valueFromLoc = zip.node(loc).get(key)
  if (areImm(value, valueFromLoc)) {
    return value.equals(valueFromLoc)
  } else {
    return R.equals(value, valueFromLoc)
  }
})

// ofKind :: String -> Location -> Boolean
export const ofKind = R.curry((kind, loc) => isOfKind(kind, zip.node(loc)))
