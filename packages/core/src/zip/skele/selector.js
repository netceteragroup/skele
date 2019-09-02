'use strict'

import * as R from 'ramda'
import I from 'immutable'

import * as zip from '../impl'

import { isStringArray } from '../select'

// Selector fns
// - A selector fn has the signature: (...args, loc) => Iterable(Location)
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return an iterable of locations that have been selected by its execution

// children :: Location -> Iterable(Location)
export const children = loc => childrenAt(null, loc)

// Key = String | [String]
// childrenAt :: Key -> Location -> Iterable(Location)
export const childrenAt = R.curry((key, loc) => I.Seq(_childrenAt(key, loc)))

const _childrenAt = function*(key, loc) {
  let childLoc = zip.down(loc)
  if (childLoc != null) {
    const child = zip.node(childLoc)
    if (
      R.isNil(key) ||
      (isStringArray(key) && R.contains(child.get('propertyName'), key)) ||
      (R.is(String)(key) && child.get('propertyName') === key)
    ) {
      if (child.get('isSingle')) {
        yield zip.down(childLoc)
      } else {
        let currentChild = zip.down(childLoc)
        yield currentChild
        while ((currentChild = zip.right(currentChild)) != null) {
          yield currentChild
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
          yield zip.down(childLoc)
        } else {
          let currentChild = zip.down(childLoc)
          yield currentChild
          while ((currentChild = zip.right(currentChild)) != null) {
            yield currentChild
          }
        }
      }
    }
  }
}
