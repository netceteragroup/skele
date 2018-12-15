'use strict'

import * as R from 'ramda'
import { data, zip, registry } from '@skele/core'
const memoize = registry.memoize

export function enricher(config) {
  const { registry, elementZipper } = config

  // eslint-disable-next-line no-unused-vars
  if (registry.isEmpty()) return async (el, context = {}) => el // identity

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
    if (zip.isBranch(loc)) {
      const children = zip.children(loc)
      if (children != null) {
        const changedChildren = await Promise.all(
          // prettier-ignore
          data.flow(
            children,
            R.map(R.pipe(elementZipper, loc => postWalk(loc, context)))
          )
        )
        loc = zip.replace(
          zip.makeNode(loc, zip.node(loc), R.map(zip.node, changedChildren)),
          loc
        )
      }
    }

    const elEnricher = data.flow(
      loc,
      zip.node,
      data.kindOf,
      elementEnricher
    )

    if (elEnricher != null) {
      const changedValue = await elEnricher(zip.node(loc), context)

      loc = zip.replace(changedValue, loc)
    }

    return loc
  }

  return async (el, context = {}) =>
    zip.node(await postWalk(elementZipper(el), context))
}
