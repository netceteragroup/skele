/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'

import { canonical, isOfKind, kindOf } from '../'

describe('element benchmarks', () => {
  const detective1 = I.fromJS({
    kind: 'detective',
    name: 'Sherlock Holmes',
  })
  const detective2 = I.fromJS({
    kind: ['detective', 'the'],
    name: 'Sherlock Holmes',
  })
  const detective3 = I.fromJS({
    kind: ['detective', 'the', 'smartest'],
    name: 'Sherlock Holmes',
  })
  const detective4 = I.fromJS({
    kind: ['detective', 'the', 'smartest', 'ever'],
    name: 'Sherlock Holmes',
  })

  test.skip('canonical', () => {
    new Suite()
      .add('canonical memoized', () => {
        canonical('detective')
        canonical(['detective', 'the'])
        canonical(['detective', 'the', 'smartest'])
        canonical(['detective', 'the', 'smartest', 'ever'])
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .run()
  })

  test.skip('isOfKind', () => {
    new Suite()
      .add('isOfKind memoized', () => {
        isOfKind('detective', detective3)
        isOfKind(['detective', 'the'], detective3)
        isOfKind(['detective', 'the', 'smartest'], detective3)
        isOfKind(['detective', 'the', 'smartest', 'ever'], detective3)
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .run()
  })

  test.skip('kindOf', () => {
    new Suite()
      .add('kindOf memoized', () => {
        kindOf(detective1)
        kindOf(detective2)
        kindOf(detective3)
        kindOf(detective4)
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .run()
  })
})
