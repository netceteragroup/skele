'use strict'

import R from 'ramda'
import { kindOf } from '../data/element'
import { Map } from 'immutable'

import { postWalk, root, value } from '../zip'

export function transformer(registry, elementZipper) {
  const elementTransformer = memoize(kind =>
    registry.get(kind).reduce((f, g) => x => g(f(x)), R.identity)
  )
  const transform = element => elementTransformer(kindOf(element))(element)

  return R.pipe(elementZipper, postWalk(transform), root, value)
}

const notPresent = '@@girders-elements/_notPreset'

function memoize(fn) {
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
