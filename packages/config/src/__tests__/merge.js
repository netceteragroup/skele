'use strict'

import deepMerge from '../utils/merge'

describe('merge utils', () => {
  test('deep merge with undefined', () => {
    const toBeMerged = { a: 1 }

    expect(deepMerge(toBeMerged, undefined)).toEqual(toBeMerged)
    expect(deepMerge(undefined, toBeMerged)).toEqual(toBeMerged)
  })

  test('deep merge with lists', () => {
    const tbm1 = { a: [1, 2, 3], b: [100] }
    const tbm2 = { a: [5, 6, 7], c: 9 }

    expect(deepMerge(tbm1, tbm2)).toEqual({ a: [5, 6, 7], b: [100], c: 9 })
  })
})
