'use strict'

export const partial = (f, ...args) => f.bind(null, ...args)
export const complement = f => (...args) => !f(...args)

export const prop = (p, obj) => obj[p]
export const propd = (p, dflt, obj) => (obj[p] != null ? obj[p] : dflt)
export const path = (path, obj) => {
  let c = obj

  for (const prop in path) {
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
