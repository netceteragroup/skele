'use strict'

import { Map, List } from 'immutable'

import AbstractRegistry from './AbstractRegistry'

export default class Registry extends AbstractRegistry {
  constructor() {
    super()
    this._registry = new Map()
  }

  register(kind, element) {
    const adaptedKey = this._adaptKey(kind)
    this._registry = this._registry.set(adaptedKey, element)
  }

  reset() {
    this._registry = new Map()
  }

  _adaptKey(key) {
    if (key instanceof List) {
      // cast
      return key
    }

    if (Array.isArray(key)) {
      return List(key)
    }

    return List.of(key)
  }

  _getInternal(key) {
    return this._registry.get(key)
  }

  _lessSpecificKey(key) {
    return key.count() > 0 ? key.butLast() : undefined
  }
}
