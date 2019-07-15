'use strict'

import invariant from 'invariant'

export function curry(fn, args = []) {
  return (..._args) =>
    (rest => (rest.length >= fn.length ? fn(...rest) : curry(fn, rest)))([
      ...args,
      ..._args,
    ])
}
export const partial = (f, ...args) => (...rest) => f(...args, ...rest)

export const complement = f => (...args) => !f(...args)

export const prop = curry((p, obj) => obj[p])
export const path = curry((ps, obj) => {
  let c = obj

  for (const prop of ps) {
    c = c[prop]
    if (c == null) return undefined
  }

  return c
})

export const map = curry((f, coll) => (coll || []).map(f))
export const mapObjVals = curry((f, obj) => {
  let ret = {}
  for (const k in obj) {
    ret[k] = f(obj[k])
  }

  return ret
})

export const flatMap = curry((f, coll) => {
  let res = []
  ;(coll || []).forEach((v, i) => {
    Array.prototype.push.apply(res, f(v, i))
  })
  return res
})

export const every = curry((f, coll) => {
  for (const x of coll) {
    if (!f(x)) return false
  }
  return true
})

export const objValues = obj => {
  let res = []
  for (const k in obj) {
    res.push(obj[k])
  }

  return res
}

export const assoc = curry((p, value, obj) => ({ ...obj, [p]: value }))
export const merge = curry((a, b) => ({ ...a, ...b }))
export const update = curry((p, fn, obj) => assoc(p, fn(prop(p, obj)), obj))

export const filter = curry((pred, coll) => (coll || []).filter(pred))
export const find = curry((pred, coll) => (coll || []).find(pred))

export const select = filter
export const reject = curry((pred, coll) =>
  (coll || []).filter(complement(pred))
)
export const flatten = coll =>
  coll.length <= 1 ? coll : coll[0].concat(...coll.slice(1))

export const isNil = value => value == null

export const always = x => () => x

export const identity = x => x

export const pipe = (...fs) => x => fs.reduce((r, f) => f(r), x)

export const isEmpty = coll =>
  coll == null ? true : Array.isArray(coll) ? coll.length === 0 : true

export const isSymbol = x => typeof x === 'symbol'
export const isTrue = x => !!x
export const isBoolean = x => typeof x === 'boolean'
export const isFunction = x => typeof x === 'function'
export const isEnumerated = curry((enumeration, x) => {
  for (const k in enumeration) {
    if (x === enumeration[k]) return true
  }
  return false
})

export const first = coll => (isEmpty(coll) ? undefined : coll[0])
export const last = coll => (isEmpty(coll) ? undefined : coll[coll.length - 1])
export const flow = (value, ...fns) => {
  let v = value
  fns.forEach(f => {
    v = f(v)
  })
  return v
}

export const when = (test, f) => x => (test(x) ? f(x) : x)

export const splitWhen = (pred, list) => {
  var idx = 0
  var len = list.length
  var prefix = []

  while (idx < len && !pred(list[idx])) {
    prefix.push(list[idx])
    idx += 1
  }

  return [prefix, Array.prototype.slice.call(list, idx)]
}

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
