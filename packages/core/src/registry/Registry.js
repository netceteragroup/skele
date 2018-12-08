'use strict'

import { List } from 'immutable'
import Trie from './impl/Trie'

export function adaptKey(key) {
  // prettier-ignore
  if (key instanceof List) {
    if (key.size === 0) return []
    if (key.size === 1) return [key.get(0)]
    if (key.size === 2) return [key.get(0), key.get(1)]
    if (key.size === 3) return [key.get(0), key.get(1), key.get(2)]
    if (key.size === 4) return [key.get(0), key.get(1), key.get(2), key.get(3)]
    if (key.size === 5) return [key.get(0), key.get(1), key.get(2), key.get(3), key.get(4)]
    return key.toArray()
  }
  return key
}

// use verbatim objects as prototype lookup is known to be slow
// in most VMs (cf. Inferno library design)
export default function Registry() {
  this._registry = new Trie()

  this.register = function(kind, obj) {
    this._registry.register(adaptKey(kind), obj)
  }

  this.get = function(key) {
    return this._registry.get(adaptKey(key), true)
  }

  this.getEntry = function(key) {
    return this._registry.getEntry(adaptKey(key), true)
  }

  this.collector = function(key) {
    return this._registry.collector(key)
  }

  this.isEmpty = function() {
    return this._registry.isEmpty
  }

  this.reset = function() {
    this._registry = new Trie()
  }
}
