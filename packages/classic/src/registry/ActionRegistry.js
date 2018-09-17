'use strict'

import { List } from 'immutable'

import { registry } from '@skele/core'
import * as actions from '../action'

const { Registry } = registry

export const keyFor = (kind, action) => ({
  kind: kind instanceof List ? kind.toArray() : kind,
  action,
})

export const keyFromAction = ({
  [actions.actionMetaProperty]: { kind },
  type,
}) => keyFor(kind, type)

export function ActionRegistry() {
  this._registry = new Registry()

  this.register = function(key, obj) {
    let en = this._registry.getEntry(key.kind)
    let aMap
    if (en == null || en.key.length !== key.kind.length) {
      aMap = {}
      this._registry.register(key.kind, aMap)
    } else {
      aMap = en.value
    }

    aMap[key.action] = obj
  }

  this.get = function(key) {
    const en = this.getEntry(key)
    return en != null ? en.value : undefined
  }

  this.getEntry = function(key) {
    let bestMatch
    for (const en of this.collector(key)) {
      bestMatch = en
    }

    return bestMatch
  }

  this.collector = function*(key) {
    for (const en of this._registry.collector(key.kind)) {
      const value = en.value[key.action]
      if (value != null) {
        yield {
          key: {
            kind: en.key,
          },
          value,
        }
      }
    }
  }

  this.isEmpty = function() {
    return this._registry.isEmpty()
  }

  this.reset = function() {
    this._registry = new Registry()
  }
}

ActionRegistry.keyFor = keyFor
ActionRegistry.keyFromAction = keyFromAction

// TODO this class has no tests yet. make sure you write some before using it
export function ActionMultivalueRegistry() {
  this._registry = new Registry()

  this.register = function(key, obj) {
    let en = this._registry.getEntry(key.kind)
    let aMap
    if (en == null || en.key.length !== key.kind.length) {
      aMap = {}
      this._registry.register(key.kind, aMap)
    } else {
      aMap = en.value
    }

    let objs = aMap[key.action]
    if (objs == null) {
      objs = []
      aMap[key.action] = objs
    }

    objs.push(obj)
  }

  this.get = function(key) {
    const en = this.getEntry(key)
    return en != null ? en.value : undefined
  }

  this.getEntry = function(key) {
    let all = []
    for (const en of this.collector(key)) {
      Array.prototype.push.apply(all, en.value)
    }

    return all
  }

  this.collector = function*(key) {
    for (const en of this._registry.collector(key.kind)) {
      const objs = en.value[key.action]
      if (objs != null) {
        yield {
          key: {
            kind: en.key,
          },
          objs,
        }
      }
    }
  }

  this.isEmpty = function() {
    return this._registry.isEmpty()
  }

  this.reset = function() {
    this._registry = new Registry()
  }
}

ActionMultivalueRegistry.keyFor = keyFor
ActionMultivalueRegistry.keyFromAction = keyFromAction
