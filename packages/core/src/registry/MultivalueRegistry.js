'use strict'

import Registry from './Registry'
import { List } from 'immutable'

export default class MultivalueRegistry extends Registry {
  register(kind, value) {
    const adaptedKey = this._adaptKey(kind)
    this._registry = this._registry.update(adaptedKey, bag =>
      (bag || List()).push(value)
    )
  }

  _getBySpecificity(key, useSpecificity) {
    if (useSpecificity) {
      const lessSpecificKey = this._lessSpecificKey(key)

      if (lessSpecificKey) {
        const lessSpecific =
          this._getBySpecificity(lessSpecificKey, true) || List()
        const exact = this._getInternal(key) || List()

        return lessSpecific.concat(exact)
      }
    }
    return super._getBySpecificity(key, useSpecificity)
  }
}
