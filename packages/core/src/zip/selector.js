'use strict'

import R from 'ramda'

import * as zip from './impl'

import { isOfKind } from '../data'

import { isStringArray } from './select'

// Selector fns
// - A selector fn has the signature: (...args, loc) => [loc]
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return a an array of locations that have been selected by its execution

const isNotChildCollection = R.complement(isOfKind('@@skele/child-collection'))

// children :: Location -> [Location]
export const elementChildren = loc => elementChildrenFor(null, loc)

// Key = String | [String]
// childrenFor :: Key -> Location -> [Location]
export const elementChildrenFor = R.curry((key, loc) => {
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
        while ((currentChild = zip.right(currentChild)) != null) {
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
          while ((currentChild = zip.right(currentChild)) != null) {
            result.push(currentChild)
          }
        }
      }
    }
  }
  return result
})

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
