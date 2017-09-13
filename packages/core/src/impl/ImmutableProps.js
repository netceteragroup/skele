'use strict'

import React from 'react'
import shouldUpdate from 'omniscient/shouldupdate'
import invariant from 'invariant'

import { isSubclassOf } from './classes'
/**
 * A mixin that adds shouldComponentUpdate functionality that handles immutable data efficiently.
 *
 * Uses Omniscient internally.
 */
export default SuperClass => {
  invariant(
    SuperClass != null && isSubclassOf(SuperClass, React.Component),
    'SuperClass must be a class that inherits from React.Component'
  )

  const Mixin = class extends SuperClass {}
  Mixin.prototype.shouldComponentUpdate = shouldUpdate
  return Mixin
}
