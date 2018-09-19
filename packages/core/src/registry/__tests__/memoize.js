'use strict'

import memoize from '../memoize'

describe('memoize', () => {
  let finder = jest.fn(key => (Array.isArray(key) ? key.length : 1))
  let misser = jest.fn(() => undefined)

  afterEach(() => {
    finder.mockClear()
    misser.mockClear()
  })

  test('found (defined) entries', () => {
    const memoized = memoize(finder)

    expect(memoized('foo')).toEqual(1)
    expect(finder).toHaveBeenCalledTimes(1)
    expect(memoized('foo')).toEqual(1)
    expect(finder).toHaveBeenCalledTimes(1)

    expect(memoized(['foo', 'bar'])).toEqual(2)
    expect(finder).toHaveBeenCalledTimes(2)
    expect(memoized(['foo', 'bar'])).toEqual(2)
    expect(finder).toHaveBeenCalledTimes(2)
  })

  test('missing (undefined) entries', () => {
    const memoized = memoize(misser)

    expect(memoized('foo')).toBeUndefined()
    expect(misser).toHaveBeenCalledTimes(1)
    expect(memoized('foo')).toBeUndefined()
    expect(misser).toHaveBeenCalledTimes(1)

    expect(memoized(['foo', 'bar'])).toBeUndefined()
    expect(misser).toHaveBeenCalledTimes(2)
    expect(memoized(['foo', 'bar'])).toBeUndefined()
    expect(misser).toHaveBeenCalledTimes(2)
  })

  test('custom cachekey extractor', () => {
    const fn = jest.fn(key => [key.kind, '.', key.action])
    const memoized = memoize(fn, key => [
      ...(Array.isArray(key.kind) ? key.kind : [key.kind]),
      '$$sep$$',
      key.action,
    ])

    expect(memoized({ kind: 'foo', action: 'update' })).toEqual([
      'foo',
      '.',
      'update',
    ])
    expect(fn).toHaveBeenCalledTimes(1)
    expect(memoized({ kind: 'foo', action: 'update' })).toEqual([
      'foo',
      '.',
      'update',
    ])
    expect(fn).toHaveBeenCalledTimes(1)

    fn.mockClear()

    expect(memoized({ kind: ['foo', 'bar'], action: 'update' })).toEqual([
      ['foo', 'bar'],
      '.',
      'update',
    ])
    expect(fn).toHaveBeenCalledTimes(1)
    expect(memoized({ kind: ['foo', 'bar'], action: 'update' })).toEqual([
      ['foo', 'bar'],
      '.',
      'update',
    ])
    expect(fn).toHaveBeenCalledTimes(1)

    fn.mockClear()

    expect(memoized({ kind: 'foo', action: 'update2' })).toEqual([
      'foo',
      '.',
      'update2',
    ])
    expect(fn).toHaveBeenCalledTimes(1)
    expect(memoized({ kind: 'foo', action: 'update2' })).toEqual([
      'foo',
      '.',
      'update2',
    ])
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
