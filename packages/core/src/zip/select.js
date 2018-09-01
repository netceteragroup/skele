'use strict'

import I from 'immutable'
import R from 'ramda'

import { isOfKind, flow } from '../data'

export const isStringArray = obj =>
  flow(
    obj,
    R.allPass([R.is(Array), R.or(R.all(R.is(String)), R.propEq('length', 0))])
  )
const isImm = I.Iterable.isIterable
const areImm = (...vals) => flow(vals, R.all(isImm))
const isTrue = R.allPass([R.is(Boolean), R.equals(true)])
const isLocation = loc =>
  loc &&
  loc.meta &&
  loc.meta.isBranch &&
  loc.meta.getChildren &&
  loc.meta.makeItem
export const isLocationArray = obj =>
  flow(
    obj,
    R.allPass([R.is(Array), R.complement(R.isEmpty), R.all(isLocation)])
  )
const isNotChildCollection = R.complement(isOfKind('@@skele/child-collection'))

// child :: String -> Location -> Location
export const child = R.curry((key, loc) => {
  if (loc.canGoDown()) {
    let childLoc = loc.down()
    const child = childLoc.value()
    if (child.get('propertyName') === key) {
      return childLoc.down()
    }
    while (childLoc.canGoRight()) {
      childLoc = childLoc.right()
      const child = childLoc.value()
      if (child.get('propertyName') === key) {
        return childLoc.down()
      }
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
  if (loc.canGoDown()) {
    let childLoc = loc.down()
    const child = childLoc.value()
    if (
      R.isNil(key) ||
      (isStringArray(key) && R.contains(child.get('propertyName'), key)) ||
      (R.is(String)(key) && child.get('propertyName') === key)
    ) {
      if (child.get('isSingle')) {
        result.push(childLoc.down())
      } else {
        let currentChild = childLoc.down()
        result.push(currentChild)
        if (currentChild.canGoRight()) {
          currentChild = currentChild.right()
          result.push(currentChild)
        }
      }
    }
    while (childLoc.canGoRight()) {
      childLoc = childLoc.right()
      const child = childLoc.value()
      if (
        R.isNil(key) ||
        (isStringArray(key) && R.contains(child.get('propertyName'), key)) ||
        (R.is(String)(key) && child.get('propertyName') === key)
      ) {
        if (child.get('isSingle')) {
          result.push(childLoc.down())
        } else {
          let currentChild = childLoc.down()
          result.push(currentChild)
          if (currentChild.canGoRight()) {
            currentChild = currentChild.right()
            result.push(currentChild)
          }
        }
      }
    }
  }
  return result
})

// ofKind :: String -> Location -> Boolean
export const ofKind = R.curry((kind, loc) => isOfKind(kind, loc.value()))

// ancestors :: () -> Location -> [Location]
export const ancestors = loc => {
  const result = []
  let currentLoc = loc
  while (currentLoc.canGoUp()) {
    currentLoc = currentLoc.up()
    if (isNotChildCollection(currentLoc.value())) {
      result.push(currentLoc)
    }
  }
  return result
}

// descendants :: () -> Location -> [Location]
export const descendants = loc => _descendants(loc)

const _descendants = (loc, collector = []) => {
  if (loc.canGoDown()) {
    const current = loc.down()
    _descendants(current, collector)
    if (isNotChildCollection(current.value())) {
      collector.push(current)
    }
  }
  if (loc.canGoRight()) {
    const current = loc.right()
    _descendants(current, collector)
    if (isNotChildCollection(current.value())) {
      collector.push(current)
    }
  }
  return collector
}

// propEq :: (String, Any) -> Location -> Boolean
export const propEq = R.curry((key, value, loc) => {
  const valueFromLoc = loc.value().get(key)
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
      result = result.filter(loc => isOfKind(pred, loc.value()))
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
