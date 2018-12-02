/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'

import { canonical, isOfKind } from '../'

describe('element benchmarks', () => {
  const detective = I.fromJS({
    kind: ['detective', 'the', 'smartest'],
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
        isOfKind('detective', detective)
        isOfKind(['detective', 'the'], detective)
        isOfKind(['detective', 'the', 'smartest'], detective)
        isOfKind(['detective', 'the', 'smartest', 'ever'], detective)
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .run()
  })
})
