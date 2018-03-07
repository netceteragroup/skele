'use strict'

import { Map } from 'immutable'

const notPresent = '@@skele/_notPreset'

export function memoize(fn) {
  let cache = Map()

  return arg => {
    let res = cache.get(arg)

    if (res === notPresent) return undefined
    if (res != null) return res

    res = fn(arg)

    if (res == null) res = notPresent
    cache = cache.set(arg, res)

    return res === notPresent ? undefined : res
  }
}

// Use to time an async function
export function time(note, fn) {
  if (process.env.SKELE_PROFILING !== 'enable') {
    return fn
  }
  return async (...args) => {
    const start = Date.now()
    const result = await fn(...args)
    const end = Date.now()
    console.log(`${note} took ${end - start} ms`)
    return result
  }
}

// Use to time a sync function
export function timeSync(note, fn) {
  if (process.env.SKELE_PROFILING !== 'enable') {
    return fn
  }
  return (...args) => {
    const start = Date.now()
    const result = fn(...args)
    const end = Date.now()
    console.log(`${note} took ${end - start} ms`)
    return result
  }
}
