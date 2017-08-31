'use strict'

import * as Utils from '../utils'

describe('viewport utils', () => {
  it('calculates isInViewport correctly', () => {
    expect(Utils.isInViewport(0, 0, 0, 0, 0)).toEqual(true)

    // element above viewport
    expect(Utils.isInViewport(50, 100, 0, 20, 0)).toEqual(false)
    expect(Utils.isInViewport(50, 100, 0, 20, 0.5)).toEqual(true)

    // element inside viewport
    expect(Utils.isInViewport(50, 100, 40, 20, 0)).toEqual(true)
    expect(Utils.isInViewport(50, 100, 70, 20, 0)).toEqual(true)
    expect(Utils.isInViewport(50, 100, 90, 20, 0)).toEqual(true)

    // element below viewport
    expect(Utils.isInViewport(0, 100, 200, 20, 0.5)).toEqual(false)
    expect(Utils.isInViewport(0, 100, 200, 20, 1)).toEqual(true)
  })
})
