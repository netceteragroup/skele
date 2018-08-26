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
const isLocation = null
const isLocationArray = R.all(isLocation)

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
export const descendants = (loc, collector = []) => {
  if (loc.canGoDown()) {
    const current = loc.down()
    descendants(current, collector)
    if (!isOfKind('@@skele/child-collection', current.value())) {
      collector.push(current)
    }
  }
  if (loc.canGoRight()) {
    const current = loc.right()
    descendants(current, collector)
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
  for (const pred of predicates) {
    if (R.empty(pred)) {
      return result
    }

    let newResult = null
    if (R.is(String)(pred)) {
      newResult = result.map(loc => child(key, loc)).filter(l => !!l)
    } else if (isStringArray(pred)) {
      newResult = result.filter(loc => ofKind(pred, loc))
    } else if (R.is(Function)(pred)) {
      newResult = pred(...result)
    } else {
      console.warn('Unknown predicate', pred)
      return result
    }

    if (isLocationArray(newResult)) {
      result = newResult
    } else if (isLocation(newResult)) {
      result = [newResult]
    } else if (isTrue(newResult)) {
      // pass to the next predicate
    } else if (isFalsy(newResult)) {
      result = null
      break
    } else {
      console.warn('Unknown processing result in select', result)
      result = null
      break
    }
  }
  return result
}
