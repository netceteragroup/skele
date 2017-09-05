'use strict'

import I from 'immutable'

const notPresent = '@@girders-elements/_notPresent'

export default SuperClass =>
  class extends SuperClass {
    constructor(...args) {
      super(...args)
      this._memoizationCache = I.Map()
    }

    register(...args) {
      if (super.register) super.register(...args)
      this._memoizationCache = I.Map()
    }

    reset() {
      if (super.reset) super.reset()
      this._memoizationCache = I.Map()
    }

    get(key) {
      let adaptedKey = this._adaptKey(key)

      let val = this._memoizationCache.get(adaptedKey)

      if (val === notPresent) {
        return undefined
      } else if (val == null) {
        val = super.get(key)

        if (val == null) {
          this._memoizationCache = this._memoizationCache.set(
            adaptedKey,
            notPresent
          )
        } else {
          this._memoizationCache = this._memoizationCache.set(adaptedKey, val)
        }
      }
    }
  }
