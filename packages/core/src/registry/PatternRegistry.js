'use strict'

import AbstractRegistry from './AbstractRegistry'
import { List, is, Iterable } from 'immutable'
import * as R from 'ramda'

export default function PatternRegistry() {
  this._registry = new List()

  this.register = function(key, value) {
    let pattern
    if (typeof key === 'function') {
      pattern = List.of(key, value)
    } else if (key instanceof RegExp) {
      const regexp = key
      pattern = List.of(regexp.test.bind(regexp), value)
    } else {
      pattern = List.of(equals(key), value)
    }
    this._registry = this._registry.push(pattern)
  }

  this.isEmpty = function() {
    return this._registry.count() === 0
  }

  this.reset = function() {
    this._registry = new List()
  }

  this.get = function(key) {
    let result = this._registry.find(r => r.get(0)(key))

    if (result) {
      return result.get(1)
    }
  }

  this.getEntry = function(key) {
    const res = this.get(key)

    if (res != null) {
      return {
        key: [key],
        value: res,
      }
    }

    return undefined
  }
}

const equals = R.curryN(
  2,
  R.ifElse(
    (a, b) => Iterable.isIterable(a) && Iterable.isIterable(b),
    is,
    R.equals
  )
)
