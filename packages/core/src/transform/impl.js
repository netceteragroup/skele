'use strict'

import R from 'ramda'
import { kindOf } from '../data/element'
import { memoize } from '../impl/util'

import { postWalk, root, value } from '../zip'

export function transformer(registry, elementZipper) {
  const elementTransformer = memoize(kind =>
    registry.get(kind).reduce((f, g) => x => g(f(x)), R.identity)
  )
  const transform = element => elementTransformer(kindOf(element))(element)

  return R.pipe(elementZipper, postWalk(transform), root, value)
}
