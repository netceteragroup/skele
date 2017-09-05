'use strict'

import AbstractRegistry from './AbstractRegistry'
import { List } from 'immutable'

export default class PatternRegistry extends AbstractRegistry {
  constructor() {
    super()
    this._registry = new List()
  }

  register(key, value) {
    if (typeof key === 'function') {
      this._registry = this._registry.push(List.of(key, value))
    } else if (key instanceof RegExp) {
      const regexp = key
      this._registry = this._registry.push(
        List.of(regexp.test.bind(regexp), value)
      )
    } else {
      throw new Error('Key must be a function or a regexp')
    }
  }

  reset() {
    this._registry = new List()
  }
  _adaptKey(key) {
    return key
  }

  _getInternal(key) {
    let result = this._registry.find(r => r.get(0)(key))

    if (result) {
      return result.get(1)
    }
  }

  _lessSpecificKey() {
    return null
  }
}
