/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'
import * as R from 'ramda'

import * as zip from '..'
import * as data from '../../data'

import {
  postWalk as zippaPostWalk,
  value as zippaValue,
  makeZipper as zippaMakeZipper,
} from 'zippa'

import navigation from './fixture/navigation.json'

describe('elementZipper walking benchmarks', () => {
  const state = I.fromJS(navigation)

  const update = cmsIds => el => {
    if (
      data.isOfKind(['component', 'action-buttons'], el) &&
      cmsIds.includes(el.get('cmsId'))
    ) {
      return el.set('bookmarked', true)
    }
    return el
  }

  test.skip('alternative walking strategies', () => {
    const testWithPostWalkFromZippa = cmsIds =>
      R.pipe(
        zip.elementZipper({ makeZipperOverride: zippaMakeZipper }),
        zippaPostWalk(update(cmsIds)),
        zippaValue
      )

    const testWithNaiveImmutableMapPostWalk = cmsIds =>
      naiveImmMapPostWalk(el => {
        if (el && el.get && el.get('kind')) {
          return update(cmsIds)(el)
        }
        return el
      })

    const testWithCustomPostWalk = cmsIds =>
      R.pipe(
        zip.elementZipper({}),
        zip.postWalk(update(cmsIds)),
        zip.node
      )

    new Suite()
      .add('with zippa implementation', () => {
        testWithPostWalkFromZippa(I.List('ld.1439195'))(state)
      })
      .add('with naive map walking', () => {
        testWithNaiveImmutableMapPostWalk(I.List('ld.1439195'))(state)
      })
      .add('with custom implementation', () => {
        testWithCustomPostWalk(I.List('ld.1439195'))(state)
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
      })
      .run()
  })
  // 11.12.2018, 12:30, Andon Machine:
  // with zippa implementation x 13.53 ops/sec ±20.76% (34 runs sampled)
  // with naive map walking x 51.47 ops/sec ±5.86% (56 runs sampled)
  // with custom implementation x 56.84 ops/sec ±5.48% (63 runs sampled)
  // Fastest is with custom implementation
})

const postwalk = (f, struct) => {
  return walk(postwalk.bind(undefined, f), f, struct)
}

const naiveImmMapPostWalk = R.curry(postwalk)

function walk(inner, outer, struct) {
  if (I.Iterable.isIterable(struct)) {
    return outer(struct.map(inner))
  } else {
    return outer(struct)
  }
}
