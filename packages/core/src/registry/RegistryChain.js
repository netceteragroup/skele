'use strict'

import AbstractRegistry from './AbstractRegistry'
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

  _getInternal(key) {
    let val = this._primaryRegistry._getInternal(
      this._primaryRegistry._adaptKey(key)
    )

    if (!val) {
      val = this._fallbackRegistry._getInternal(
        this._fallbackRegistry._adaptKey(key)
      )
    }
  }

  _adaptKey(key) {
    return key
  }

  _lessSpecificKey(key) {
    return this._primaryRegistry._lessSpecificKey(key)
  }
}

export class MultivalueRegistryChain extends RegistryChain {}

MultivalueRegistryChain.prototype._getBySpecificity =
  MultivalueRegistry.prototype._getBySpecificity
