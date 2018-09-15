'use strict'

import { adaptKey } from './Registry'
import Trie from './impl/Trie'
import { List } from 'immutable'

export default function MultivalueRegistry() {
  this._registry = new Trie()

  this.register = function(kind, obj) {
    const key = adaptKey(kind)
    let bag = this._registry.get(key)
    if (bag == null) {
      bag = [obj]
      this._registry.register(key, bag)
    } else {
      bag.push(obj)
    }
  }

  this.get = function(key) {
    return List(this._registry.collect(adaptKey(key)))
  }

  this.collector = function(key) {
    return this._registry.collector(adaptKey(key))
  }

  this.isEmpty = function() {
    return this._registry.isEmpty
  }

  this.reset = function() {
    this._registry = new Trie()
  }
}
