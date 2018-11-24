/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'

import { isOfKind, isOfKindNonCurried, isOfKindSimpleCurried } from '../index'

describe('element benchmarks', () => {
  const detective = I.fromJS({
    kind: ['detective', 'the', 'smartest'],
    name: 'Sherlock Holmes',
  })

  test.skip('isOfKind', () => {
    new Suite()
      .add('isOfKind curried', () => {
        isOfKind(['detective'], detective)
      })
      .add('isOfKind non curried', () => {
        isOfKindNonCurried(['detective'], detective)
      })
      .add('isOfKind simple curry', () => {
        isOfKindSimpleCurried(['detective'], detective)
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
