'use strict'

import I from 'immutable'
import R from 'ramda'

import * as zip from './impl'

import { isOfKind, flow } from '../data'

export const isStringArray = R.allPass([
  R.is(Array),
  R.or(R.all(R.is(String)), R.propEq('length', 0)),
])

const isImm = I.Iterable.isIterable
const areImm = (...vals) =>
  flow(
    vals,
    R.all(isImm)
  )
const isTrue = R.allPass([R.is(Boolean), R.equals(true)])
const isLocation = loc =>
  loc && loc.meta && loc.meta.isBranch && loc.meta.children && loc.meta.makeNode
export const isLocationArray = R.allPass([
  R.is(Array),
  R.complement(R.isEmpty),
  R.all(isLocation),
])

const isNotChildCollection = R.complement(isOfKind('@@skele/child-collection'))

// child :: String -> Location -> Location
export const child = R.curry((key, loc) => {
  let childLoc = zip.down(loc)
  if (childLoc != null) {
    const child = zip.node(childLoc)
    if (child.get('propertyName') === key) {
      return zip.down(childLoc)
    }
    childLoc = zip.right(childLoc)
    while (childLoc != null) {
      const child = zip.node(childLoc)
      if (child.get('propertyName') === key) {
        return zip.down(childLoc)
      }
      childLoc = zip.right(childLoc)
    }
  }
  return null
})

// children :: Location -> [Location]
export const children = loc => childrenFor(null, loc)

// Key = String | [String]
// childrenFor :: Key -> Location -> [Location]
export const childrenFor = R.curry((key, loc) => {
  const result = []
  let childLoc = zip.down(loc)
  if (childLoc != null) {
    const child = zip.node(childLoc)
    if (
      R.isNil(key) ||
      (isStringArray(key) && R.contains(child.get('propertyName'), key)) ||
      (R.is(String)(key) && child.get('propertyName') === key)
    ) {
      if (child.get('isSingle')) {
        result.push(zip.down(childLoc))
      } else {
        let currentChild = zip.down(childLoc)
        result.push(currentChild)
        // TODO andon: shouldn't we go to the rightmost?
        currentChild = zip.right(currentChild)
        if (currentChild != null) {
          result.push(currentChild)
        }
      }
    }
    while ((childLoc = zip.right(childLoc)) != null) {
      const child = zip.node(childLoc)
      if (
        R.isNil(key) ||
        (isStringArray(key) && R.contains(child.get('propertyName'), key)) ||
        (R.is(String)(key) && child.get('propertyName') === key)
      ) {
        if (child.get('isSingle')) {
          result.push(zip.down(childLoc))
        } else {
          let currentChild = zip.down(childLoc)
          result.push(currentChild)
          // TODO andon: shouldn't we go to the rightmost?
          currentChild = zip.right(currentChild)
          if (currentChild != null) {
            result.push(currentChild)
          }
        }
      }
    }
  }
  return result
})

// ofKind :: String -> Location -> Boolean
export const ofKind = R.curry((kind, loc) => isOfKind(kind, zip.node(loc)))

// ancestors :: () -> Location -> [Location]
export const ancestors = loc => {
  const result = []
  let currentLoc = loc
  while ((currentLoc = zip.up(currentLoc)) != null) {
    if (isNotChildCollection(zip.node(currentLoc))) {
      result.push(currentLoc)
    }
  }
  return result
}

// descendants :: () -> Location -> [Location]
export const descendants = loc => _descendants(loc)

const _descendants = (loc, collector = []) => {
  let current = null
  if ((current = zip.down(loc)) != null) {
    _descendants(current, collector)
    if (isNotChildCollection(zip.node(current))) {
      collector.push(current)
    }
  }
  if ((current = zip.right(loc)) != null) {
    _descendants(current, collector)
    if (isNotChildCollection(zip.node(current))) {
      collector.push(current)
    }
  }
  return collector
}

// propEq :: (String, Any) -> Location -> Boolean
export const propEq = R.curry((key, value, loc) => {
  const valueFromLoc = zip.node(loc).get(key)
  if (areImm(value, valueFromLoc)) {
    return value.equals(valueFromLoc)
  } else {
    return R.equals(value, valueFromLoc)
  }
})

// Predicate = String | [String] | Function :: Location -> Boolean | Location | [Location]
// select :: [Predicate] -> Location -> [Location]
export const select = (...predicates) => location => {
  let result = [location]
  for (let pred of predicates) {
    if (R.is(String)(pred)) {
      result = result.map(loc => child(pred)(loc)).filter(l => !!l)
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
