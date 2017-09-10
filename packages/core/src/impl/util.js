'use strict'

import { Map } from 'immutable'

const notPresent = '@@girders-elements/_notPreset'

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
