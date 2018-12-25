'use strict'

import R from 'ramda'

import * as zip from './impl'

import { childAt } from './skele/motion'

import { isOfKind } from '../data'

export const isStringArray = R.allPass([
  R.is(Array),
  R.or(R.all(R.is(String)), R.propEq('length', 0)),
])

const isTrue = R.allPass([R.is(Boolean), R.equals(true)])
const isLocation = loc =>
  loc && loc.meta && loc.meta.isBranch && loc.meta.children && loc.meta.makeNode
export const isLocationArray = R.allPass([
  R.is(Array),
  R.complement(R.isEmpty),
  R.all(isLocation),
])

// Predicate = String | [String] | Function :: Location -> Boolean | Location | [Location]
// select :: [Predicate] -> Location -> [Location]
export const select = (...predicates) => location => {
  let result = [location]
  for (let pred of predicates) {
    if (R.is(String)(pred)) {
      result = result.map(loc => childAt(pred)(loc)).filter(l => !!l)
    } else if (isStringArray(pred)) {
      result = result.filter(loc => isOfKind(pred, zip.node(loc)))
    } else if (R.is(Function)(pred)) {
      result = R.chain(loc => {
        const res = pred(loc)
        if (isLocationArray(res) || isLocation(res)) {
          return res
        } else if (isTrue(res)) {
          return loc
        } else {
          return null
        }
      }, result).filter(l => !!l)
    } else {
      return []
    }
  }
  return result
}
