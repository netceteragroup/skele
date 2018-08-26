'use strict'

import I from 'immutable'
import R from 'ramda'

import { isOfKind } from '../data'

export const isStringArray = obj =>
  R.is(Array)(obj) && (R.all(R.is(String))(obj) || obj.length === 0)
const isImm = I.Iterable.isIterable
const areImm = (...vals) => R.all(isImm)(vals)
const isFalsy = R.anyPass([R.isNil, R.and(R.is(Boolean), R.equals(false))])
const isTrue = R.allPass([R.is(Boolean), R.equals(true)])
const isLocation = loc =>
  loc.meta && loc.meta.isBranch && loc.meta.getChildren && loc.meta.makeItem
export const isLocationArray = obj =>
  R.is(Array)(obj) && R.not(R.isEmpty(obj)) && R.all(isLocation)(obj)

// child :: String -> Location -> Location
export const child = key => loc => {
  if (loc.canGoDown()) {
    let childLoc = loc.down()
    const child = childLoc.value()
    if (child.get('propertyName') === key && child.get('isSingle')) {
      return childLoc.down()
    }
    while (childLoc.canGoRight()) {
      childLoc = childLoc.right()
      const child = childLoc.value()
      if (child.get('propertyName') === key && child.get('isSingle')) {
        return childLoc.down()
      }
    }
  }
  return null
}

// children :: (...keys) -> Location -> [Location]
export const children = (...keys) => loc => {
  const result = []
  if (loc.canGoDown()) {
    let childLoc = loc.down()
    const child = childLoc.value()
    if (R.isEmpty(keys) || R.contains(child.get('propertyName'), keys)) {
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
      if (R.isEmpty(keys) || R.contains(child.get('propertyName'), keys)) {
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
}

// ofKind :: String -> Location -> Boolean
export const ofKind = kind => loc => isOfKind(kind, loc.value())

// ancestors :: Location -> [Location]
export const ancestors = loc => {
  const result = []
  let currentLoc = loc
  while (currentLoc.canGoUp()) {
    currentLoc = currentLoc.up()
    if (!isOfKind('@@skele/child-collection', currentLoc.value())) {
      result.push(currentLoc)
    }
  }
  return result
}

// descendants :: Location -> [Location]
export const descendants = loc => _descendants(loc)

const _descendants = (loc, collector = []) => {
  if (loc.canGoDown()) {
    const current = loc.down()
    _descendants(current, collector)
    if (!isOfKind('@@skele/child-collection', current.value())) {
      collector.push(current)
    }
  }
  if (loc.canGoRight()) {
    const current = loc.right()
    _descendants(current, collector)
    if (!isOfKind('@@skele/child-collection', current.value())) {
      collector.push(current)
    }
  }
  return collector
}

// propEq :: (String, Any) -> Location -> Boolean
export const propEq = (key, value) => loc => {
  const valueFromLoc = loc.value().get(key)
  if (areImm(value, valueFromLoc)) {
    return value.equals(valueFromLoc)
  } else {
    return R.equals(value, valueFromLoc)
  }
}

// Predicate = String | [String] | Function :: Location -> Boolean | Location | [Location]
// select :: [Predicate] -> Location -> [Location]
export const select = (...predicates) => location => {
  let result = [location]
  for (let pred of predicates) {
    if (R.isNil(pred)) {
      return result
    }

    if (R.is(String)(pred)) {
      result = result.map(loc => child(pred, loc)).filter(l => !!l)
    } else if (isStringArray(pred)) {
      result = result.filter(loc => ofKind(pred, loc))
    } else if (R.is(Function)(pred)) {
      result = R.flatten(
        result
          .map(loc => {
            const res = pred(loc)
            if (isLocationArray(res) || isLocation(res)) {
              return res
            } else if (isTrue(res)) {
              return loc
            } else if (isFalsy(res)) {
              return null
            } else {
              console.warn('Unknown processing result in select', result)
              return null
            }
          })
          .filter(l => !!l)
      )
    } else {
      console.warn('Unknown predicate', pred)
      return result
    }
  }
  return result
}
