'use strict'

import R from 'ramda'

import * as zip from '../impl'

import { isStringArray } from '../select'

// Selector fns
// - A selector fn has the signature: (...args, loc) => [loc]
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return a an array of locations that have been selected by its execution

// children :: Location -> [Location]
export const children = loc => childrenAt(null, loc)

// Key = String | [String]
// childrenAt :: Key -> Location -> [Location]
export const childrenAt = R.curry((key, loc) => {
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
