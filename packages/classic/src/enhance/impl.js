'use strict'

import * as R from 'ramda'
import I from 'immutable'
import { zip } from '@skele/core'

export async function runEnhancers(el, context, enhancers) {
  return Promise.all(
    asArray(enhancers).map(e => (el == null ? e(context) : e(el, context)))
  )
}

export function applyEnhancements(result, context, enhancements) {
  const { elementZipper } = context
  const updates = compressUpdates(asArray(enhancements), elementZipper)

  return R.reduce((el, update) => update(el), result, updates)
}

// "compress updates"
// partition the updates into runs of consecutive arrays / functions
// convert consecutive arrays into a single editCond call

function compressUpdates(updates, elementZipper) {
  const slices = partitionBy(Array.isArray, updates)

  return R.chain(
    R.when(
      R.pipe(
        R.head,
        Array.isArray
      ),
      slice => [
        R.pipe(
          elementZipper,
          zip.editCond(concatAll(slice)),
          zip.value
        ),
      ]
    ),
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
const asArray = enhancements =>
  I.Iterable.isIterable(enhancements) ? enhancements.toArray() : enhancements
