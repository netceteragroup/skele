'use strict'

import * as R from 'ramda'
import { List } from 'immutable'

import Registry from './Registry'
import MultivalueRegistry from './MultivalueRegistry'

export function RegistryChain(fallback, primary) {
  this._primaryRegistry = primary
  this._fallbackRegistry = fallback

  this.register = function(kind, obj) {
    throw new Error('This is a read-only registry')
  }

  this.getEntry = function(key) {
    const primary = this._primaryRegistry.getEntry(key)
    const fallback = this._fallbackRegistry.getEntry(key)

    if (primary == null && fallback == null) return undefined
    if (primary != null && fallback == null) return primary
    if (primary == null && fallback != null) return fallback

    return primary.key.length >= fallback.key.length ? primary : fallback
  }

  this.get = function(key) {
    let en = this.getEntry(key)
    return en != null ? en.value : undefined
  }

  this.collector = makeCollector(this)

  this.isEmpty = function() {
    return this._primaryRegistry.isEmpty() && this._fallbackRegistry.isEmpty()
  }

  this.reset = function() {
    throw new Error('This is a read-only registry')
  }
}

export function MultivalueRegistryChain(fallback, primary) {
  this._fallbackRegistry = fallback
  this._primaryRegistry = primary

  this.register = function(kind, obj) {
    throw new Error('This is a read-only registry')
  }

  this.get = function(key) {
    let result = []
    for (const e of this.collector(key)) {
      Array.prototype.push.apply(result, e.value)
    }
    return List(result)
  }

  this.collector = makeCollector(this)

  this.isEmpty = function() {
    return this._primaryRegistry.isEmpty() && this._fallbackRegistry.isEmpty()
  }

  this.reset = function() {
    throw new Error('This is a read-only registry')
  }
}

// yields less specific entries of either registry (fallaback first)
// before yeilding more specific entries (fallback first)
const makeCollector = self =>
  function*(key) {
    const primary = self._primaryRegistry.collector(key)
    const fallback = self._fallbackRegistry.collector(key)

    let p = primary.next()
    let f = fallback.next()

    while (true) {
      if (p.done && f.done) break

      if (p.value != null && f.value == null) {
        yield p.value
        p = primary.next()
        continue
      }
      if (p.value == null && f.value != null) {
        yield f.value
        f = fallback.next()
        continue
      }

      if (f.value.key.length <= p.value.key.length) {
        yield f.value
        f = fallback.next()
      } else {
        yield p.value
        p = primary.next()
      }
    }
  }

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
