'use strict'

import R from 'ramda'
import I from 'immutable'

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

export const isLocationSeq = R.allPass([
  I.Iterable.isIterable,
  locSeq => R.complement(R.isEmpty)([...locSeq]),
  locSeq => R.all(isLocation)([...locSeq]),
])

// Predicate = String | [String] | Function :: Location -> Boolean | Location | Iterable(Location)
// select :: ([Predicate], Location) -> Iterable(Location)
export const select = (predicates = [], location) => {
  let result = I.Seq.of(location)
  for (let pred of predicates) {
    if (R.is(String, pred)) {
      result = result.map(loc => childAt(pred, loc)).filter(l => !!l)
    } else if (isStringArray(pred)) {
      result = result.filter(loc => isOfKind(pred, zip.node(loc)))
    } else if (R.is(Function, pred)) {
      result = result
        .flatMap(loc => {
          const res = pred(loc)
          if (isLocationSeq(res) || isLocation(res)) {
            return res
          } else if (isTrue(res)) {
            return I.Seq.of(loc)
          } else {
            return null
          }
        })
        .filter(l => !!l)
    } else {
      return I.Seq()
    }
  }
  return result
}
