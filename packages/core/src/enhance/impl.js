'use strict'

import R from 'ramda'
import { memoize } from '../impl/util'
import * as data from '../data'
import * as zip from '../zip'

export function enhancer(config) {
  const { registry, elementZipper } = config

  const enhancersForKind = memoize(kind => {
    const enhancers = registry.get(kind)
    return enhancers.isEmpty() ? null : enhancers
  })

  async function enhance(loc, context) {
    const enhancers = data.flow(loc, zip.value, data.kindOf, enhancersForKind)
    if (enhancers != null) {
      const el = zip.value(loc)
      const updates = await Promise.all(enhancers.map(e => e(el, context)))
      const enhancedValue = R.reduce((v, u) => u(v), el, updates)
      loc = zip.replace(enhancedValue, loc)
    }

    return loc
  }

  return async (el, context = {}) =>
    zip.value(await enhance(elementZipper(el), context))
}
