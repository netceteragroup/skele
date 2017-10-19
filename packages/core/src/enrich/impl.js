'use strict'

import R from 'ramda'
import { List, Seq } from 'immutable'
import { memoize } from '../impl/util'
import * as data from '../data'
import * as zip from '../zip'

export function enricher(config) {
  const { registry, elementZipper } = config

  const elementEnricher = memoize(kind => {
    const enrichers = registry.get(kind)
    return enrichers.isEmpty()
      ? null
      : enrichers.reduce(
          (f, g) => (x, context) =>
            Promise.resolve(f(x, context)).then(x => g(x, context)),
          x => Promise.resolve(x)
        )
  })

  async function postWalk(loc, context) {
    if (zip.canGoDown(loc)) {
      const changedChildren = await Promise.all(
        // prettier-ignore
        data.flow(
          zip.getChildren(loc),
          R.map(R.pipe(elementZipper, loc => postWalk(loc, context)))
        )
      )
      const changedValue = zip.makeItem(
        loc,
        zip.value(loc),
        R.map(zip.value, changedChildren)
      )

      loc = zip.replace(changedValue, loc)
    }

    const elEnricher = data.flow(loc, zip.value, data.kindOf, elementEnricher)

    if (elEnricher != null) {
      const changedValue = await elEnricher(zip.value(loc), context)

      loc = zip.replace(changedValue, loc)
    }

    return loc
  }

  return async (el, context = {}) =>
    zip.value(await postWalk(elementZipper(el), context))
}
