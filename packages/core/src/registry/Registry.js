'use strict'

import { List } from 'immutable'
import Trie from './impl/Trie'

export function adaptKey(key) {
  if (key instanceof List) {
    // cast
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
