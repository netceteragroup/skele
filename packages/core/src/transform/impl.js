'use strict'

import { identity } from 'ramda'
import { kindOf } from '../data/element'
import { memoize } from '../impl/util'

import { postWalk, root, value } from '../zip'
import { flow } from '../data'

export function transformer(registry, elementZipper) {
  const elementTransformer = memoize(kind =>
    registry
      .get(kind)
      .reduce((f, g) => (x, context) => g(f(x, context), context), identity)
  )

  const transform = context => el => elementTransformer(kindOf(el))(el, context)

  return (el, context = {}) =>
    flow(el, elementZipper, postWalk(transform(context)), root, value)
}
