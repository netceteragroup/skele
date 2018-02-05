'use strict'

import * as R from 'ramda'

import AbstractRegistry from './AbstractRegistry'
import Registry from './Registry'
import MultivalueRegistry from './MultivalueRegistry'

export class RegistryChain extends AbstractRegistry {
  constructor(fallback, primary) {
    super()
    this._fallbackRegistry = fallback
    this._primaryRegistry = primary
  }

  register() {
    throw new Error('This is a read-only registry')
  }

  reset() {
    throw new Error('This is a read-only registry')
  }

  get(key) {
    // avoid adopting the key, as we have to do it for each underlying registry
    // separately
    return this._getBySpecificity(key, true)
  }

  isEmpty() {
    return this._primaryRegistry.isEmpty() && this._fallbackRegistry.isEmpty()
  }

  _getInternal(key) {
    let val = this._primaryRegistry._getInternal(
      this._primaryRegistry._adaptKey(key)
    )

    if (!val) {
      val = this._fallbackRegistry._getInternal(
        this._fallbackRegistry._adaptKey(key)
      )
    }

    return val
  }

  _adaptKey(key) {
    // delegate to primary, to make chains of chains happy
    return this._primaryRegistry._adaptKey(key)
  }

  _lessSpecificKey(key) {
    // specificity rules are always dictated by the primary registry
    return this._primaryRegistry._lessSpecificKey(
      this._primaryRegistry._adaptKey(key)
    )
  }
}

export class MultivalueRegistryChain extends AbstractRegistry {
  constructor(fallback, primary) {
    super()
    this._fallbackRegistry = fallback
    this._primaryRegistry = primary
  }

  register() {
    throw new Error('This is a read-only registry')
  }

  reset() {
    throw new Error('This is a read-only registry')
  }

  _getInternal(key) {
    return this._fallbackRegistry
      ._getInternal(key)
      .concat(this._primaryRegistry._getInternal(key))
  }

  _adaptKey(key) {
    // always works with MultivalueRegistries so
    return this._primaryRegistry._adaptKey(key)
  }

  _lessSpecificKey(key) {
    // specificity rules are always dictated by the primary registry
    return this._primaryRegistry._lessSpecificKey(
      this._primaryRegistry._adaptKey(key)
    )
  }
}

MultivalueRegistryChain.prototype._getBySpecificity =
  MultivalueRegistry.prototype._getBySpecificity

MultivalueRegistryChain.prototype.isEmpty = RegistryChain.prototype.isEmpty

const chain = (Chain, Zero) =>
  R.cond([
    [a => a.length === 0, R.always(null)],
    [a => a.length === 1, R.head],
    [R.T, R.reduce((a, b) => new Chain(a, b), new Zero())],
  ])

export const chainRegistries = chain(RegistryChain, Registry)

export const chainMultivalueRegistries = chain(
  MultivalueRegistryChain,
  MultivalueRegistry
)
