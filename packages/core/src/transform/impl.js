'use strict'

import R from 'ramda'
import { kindOf } from '../data/element'
import { memoize } from '../impl/util'

import { postWalk, root, value } from '../zip'
import { flow } from '../data'

export function transformer(registry, elementZipper) {
  const elementTransformer = memoize(kind => context =>
    registry
      .get(kind)
      .reduce((f, g) => x => g(f(x, context), context), R.identity)
  )

  const transform = context => el => elementTransformer(kindOf(el))(context)(el)

  return (el, context = {}) =>
    flow(el, elementZipper, postWalk(transform(context)), root, value)
}
