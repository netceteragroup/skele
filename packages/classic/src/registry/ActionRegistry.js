'use strict'

import { List, Iterable } from 'immutable'

import { registry, data } from '@skele/core'
import * as actions from '../action'
import { ancestors } from '../impl/cursor'

const { Registry } = registry

export const keyFor = (kind, action) => ({
  kind: kind instanceof List ? kind.toArray() : kind,
  action,
})

export const keyFromAction = ({
  [actions.actionMetaProperty]: { kind },
  type,
}) => keyFor(kind, type)

export const findParentEntry = (lookupFn, type, cursor) => {
  for (const c of ancestors(cursor)) {
    if (!data.isElement(c)) continue

    const key = keyFor(data.kindOf(c), type)
    const entry = lookupFn(key)

    if (entry != null) {
      return {
        element: c,
        entry,
      }
    }
  }
  return undefined
}

// ideally this would be a Symbol but we aren't there yet
const sep = '$$sep$$'

// useful with core's memoize() fn for caching responses from ActionRegistries
export const cacheKey = key => {
  const kind = key.kind
  let res = Iterable.isIndexed(kind)
    ? kind.toArray()
    : Array.isArray(kind) ? kind : [kind]
  res.push(sep, key.action)

  return res
}

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
ActionRegistry.cacheKey = cacheKey
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
ActionMultivalueRegistry.cacheKey = cacheKey
ActionMultivalueRegistry.keyFromAction = keyFromAction
