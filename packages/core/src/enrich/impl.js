'use strict'

import { List } from 'immutable'
import { memoize } from '../impl/util'
import * as data from '../data'

export function enricher(registry) {
  const elementEnricher = memoize(kind =>
    registry
      .get(kind)
      .reduce(
        (f, g) => (x, context) =>
          Promise.resolve(f(x, context)).then(x => g(x, context)),
        x => Promise.resolve(x)
      )
  )

  async function postWalk(el, context) {
    const paths = data.pathsToChildElements(el)
    const changedChildren = List(
      await Promise.all(paths.map(p => postWalk(el.getIn(p), context)))
    )

    const enrichments = paths.zip(changedChildren)

    const withModifiedChildren = enrichments.reduce(
      (el, [path, value]) => el.setIn(path, value),
      el
    )
    const elEnricher = elementEnricher(data.kindOf(withModifiedChildren))
    return elEnricher(withModifiedChildren, context)
  }

  return (el, context = {}) => postWalk(el, context)
}
