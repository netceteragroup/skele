'use strict'

export default class AbstractRegistry {
  // eslint-disable-next-line no-unused-vars
  register(key, value) {
    throw new Error('Must be implemented')
  }

  get(key) {
    const resolvedKey = this._adaptKey(key)

    return this._getBySpecificity(resolvedKey, true)
  }

  isEmpty() {
    return true
  }

  reset() {
    throw new Error('Must be implemented')
  }

  // eslint-disable-next-line no-unused-vars
  _getInternal(key) {
    throw new Error('Must be implemented')
  }

  _getBySpecificity(key, useSpecificity = true) {
    let val = this._getInternal(key)

    if (val) {
      return val
    }

    if (!val && useSpecificity) {
      const newKey = this._lessSpecificKey(key)
      if (newKey) return this._getBySpecificity(newKey, useSpecificity)
    }

    return undefined
  }

  // eslint-disable-next-line no-unused-vars
  _lessSpecificKey(key) {
    throw new Error('Must be implemented')
  }

  // eslint-disable-next-line no-unused-vars
  _adaptKey(key) {
    throw new Error('Must be implemented')
  }
}
