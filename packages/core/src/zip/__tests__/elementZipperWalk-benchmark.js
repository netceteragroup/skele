/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'
import R from 'ramda'

import * as zip from '..'
import * as data from '../../data'

import { postWalk as zippaPostWalk } from '../../vendor/zippa/walk'

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
        zip.elementZipper({}),
        zippaPostWalk(update(cmsIds)),
        zip.value
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
        zip.value
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
