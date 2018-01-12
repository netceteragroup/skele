'use strict'

import R from 'ramda'
import { memoize, time } from '../impl/util'
import * as data from '../data'
import * as zip from '../zip'

export function enhancer(config) {
  const { registry, elementZipper } = config

  const enhancersForKind = memoize(kind => {
    const enhancers = registry.get(kind)
    return enhancers.isEmpty() ? null : enhancers
  })

  async function enhance(loc, context) {
    const { elementZipper } = context

    const kind = data.flow(loc, zip.value, data.kindOf)
    const enhancers = enhancersForKind(kind)
    if (enhancers != null) {
      const el = zip.value(loc)
      let updates = await time(
        `TIME-ehnacer-for-(${kind})`,
        Promise.all.bind(Promise)
      )(enhancers.map(e => e(el, context)).toArray())
      updates = compressUpdates(updates, elementZipper)
      const enhancedValue = R.reduce((v, u) => u(v), el, updates)
      loc = zip.replace(enhancedValue, loc)
    }

    return loc
  }

  return async (el, context = {}) =>
    zip.value(await enhance(elementZipper(el), context))
}

// "compress updates"
// partition the updates into runs of consequtive arrays / funtons
// convert consequtive arrays into a single editCond call

function compressUpdates(updates, elementZipper) {
  const slices = partitionBy(Array.isArray, updates)

  return R.chain(
    R.when(R.pipe(R.head, Array.isArray), slice => [
      R.pipe(elementZipper, zip.editCond(concatAll(slice)), zip.value),
    ]),
    slices
  )
}

function partitionBy(fn, list) {
  if (!R.isEmpty(list)) {
    const v = R.head(list)
    const fv = fn(v)
    const run = [v, ...R.takeWhile(x => R.equals(fv, fn(x)), R.tail(list))]

    return [run, ...partitionBy(fn, R.drop(R.length(run), list))]
  }

  return []
}

const concatAll = lists => R.reduce(R.concat, [], lists)
