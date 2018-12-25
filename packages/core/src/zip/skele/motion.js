'use strict'

import R from 'ramda'

import * as zip from '../impl'

// Motion fns
// - A motion fn has the signature: (...args, loc) => loc
// - It takes a number of arguments that determine its behavior
// - a zipper location at the end
// - and will return a location which is the result of the motion

/**
 * Motion function that goes to a named child in element zipper structure.
 *
 * @param {*} propertyName of the child
 */
export const childAt = R.curry((propertyName, loc) => {
  let childLoc = zip.down(loc)
  if (childLoc != null) {
    const child = zip.node(childLoc)
    if (child.get('propertyName') === propertyName) {
      return zip.down(childLoc)
    }
    childLoc = zip.right(childLoc)
    while (childLoc != null) {
      const child = zip.node(childLoc)
      if (child.get('propertyName') === propertyName) {
        return zip.down(childLoc)
      }
      childLoc = zip.right(childLoc)
    }
  }
  return null
})
