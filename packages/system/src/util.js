'use strict'

import invariant from 'invariant'

export const partial = (f, ...args) => f.bind(null, ...args)
export const complement = f => (...args) => !f(...args)

export const prop = (p, obj) => obj[p]
export const propd = (p, dflt, obj) => (obj[p] != null ? obj[p] : dflt)
export const path = (path, obj) => {
  let c = obj

  for (const prop of path) {
    c = c[prop]
    if (c == null) return undefined
  }

  return c
}

export const assoc = (p, value, obj) => ({ ...obj, [p]: value })
export const update = (p, fn, obj) => assoc(p, fn(prop(p, obj)), obj)

export const reject = (pred, coll) => coll.filter(complement(pred))
export const flatten = coll =>
  coll.length <= 1 ? coll : coll[0].concat(...coll.slice(1))

export const isNil = value => value == null

export const identity = x => x

export const conformUnitDef = definition => {
  invariant(
    typeof definition === 'object' || typeof definition === 'function',
    'You must provide an object or a function as the unit definition'
  )
}

export const conformSystemDef = def => {
  invariant(
    typeof def === 'object' || (Array.isArray(def) && conformEntries(def)),
    'The system definition must be an object declaring the units'
  )
}

export const conformSubsystemDef = def => {
  invariant(
    typeof def === 'function' ||
      typeof def === 'object' ||
      (Array.isArray(def) && conformEntries(def)),
    `Invalid subsystem definition. You must provide an object, a [[key, value]] array or a fn.`
  )
}
const conformEntries = arr => {
  if (arr.length === 0) return true

  arr.forEach(e => {
    if (!Array.isArray(e)) return false
    if (e.length !== 2) return false
    if (typeof e[0] !== 'string') return false
  })

  return true
}

export function newSet() {
  if (typeof Set === 'undefined') {
    return []
  } else {
    return new Set()
  }
}

export function addToSet(v, set) {
  if (typeof Set === 'undefined') {
    set.push(v)
    return set
  } else {
    return set.add(v)
  }
}

export function containedInSet(v, set) {
  if (typeof Set === 'undefined') {
    return set.indexOf(v) >= 0
  } else {
    return set.has(v)
  }
}
