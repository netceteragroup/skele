'use strict'

import R from 'ramda'
import { memoize } from '../impl/util'
import * as data from '../data'
import * as zip from '../zip'

export function extract(config) {
  const { registry, elementZipper, minNumOfArgs, maxNumOfArgs } = config

  const enhancersForKind = memoize(kind => registry.get(kind))

  async function _extract(loc, context) {
    const kind = data.flow(
      loc,
      zip.value,
      el => el.update('kind', k => k.filterNot(R.equals('__loading'))),
      data.kindOf
    )
    const enhancers = enhancersForKind(kind).filter(e =>
      R.and(
        R.or(R.isNil(minNumOfArgs), R.gte(e.length, minNumOfArgs)),
        R.or(R.isNil(maxNumOfArgs), R.lte(e.length, maxNumOfArgs))
      )
    )
    if (!enhancers.isEmpty()) {
      const el = zip.value(loc)
      return Promise.all(
        enhancers
          .map(e => (e.length <= 1 ? e(context) : e(el, context)))
          .toArray()
      )
    }

    return []
  }

  return async (el, context = {}) => await _extract(elementZipper(el), context)
}

export function execute(config) {
  const { elementZipper } = config

  function _execute(loc, ...updates) {
    if (updates != null && updates.length > 0) {
      updates = updates.length > 1 ? R.concat(...updates) : updates[0]
      updates = compressUpdates(updates, elementZipper)
      const el = zip.value(loc)
      const enhancedValue = R.reduce((v, u) => u(v), el, updates)
      loc = zip.replace(enhancedValue, loc)
    }

    return loc
  }

  return (el, ...updates) => zip.value(_execute(elementZipper(el), ...updates))
}

// "compress updates"
// partition the updates into runs of consecutive arrays / functions
// convert consecutive arrays into a single editCond call

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
