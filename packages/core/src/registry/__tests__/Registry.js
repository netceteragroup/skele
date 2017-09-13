'use strict'

import { List } from 'immutable'

import Registry from '../Registry'

describe('Registry', () => {
  const registry = new Registry()

  afterEach(() => registry.reset())

  it('can be created and used in key-value (map) fashion', () => {
    expect(registry.get('detective')).toEqual(undefined)

    registry.register('detective', 'Sherlock Holmes')
    expect(registry.get('detective')).toEqual('Sherlock Holmes')
  })

  it('allows arrays for keys', () => {
    registry.register(['a', 'b'], 1)

    expect(registry.get('detective')).toBeUndefined()
    expect(registry.get(['a', 'c'])).toBeUndefined()
    expect(registry.get(['a', 'b'])).toEqual(1)
  })

  it('allows lists for keys; can be used interexchangeably with arrays', () => {
    registry.register(['a', 'b'], 1)
    registry.register(List.of('c', 'd'), 2)

    expect(registry.get(List.of('a', 'b'))).toEqual(1)
    expect(registry.get(List.of('c', 'd'))).toEqual(2)
    expect(registry.get(['c', 'd'])).toEqual(2)
  })

  it('makes treats X and [X] equivalently', () => {
    registry.register('a', 1)
    registry.register(['b'], 2)

    expect(registry.get('a')).toEqual(1)
    expect(registry.get(['a'])).toEqual(1)

    expect(registry.get('b')).toEqual(2)
    expect(registry.get(['b'])).toEqual(2)
  })

  it('when using lists, performs lookups by lessening the specificity', () => {
    registry.register('a', 1)
    registry.register(['a', 'b'], 2)

    expect(registry.get('a')).toEqual(1)
    expect(registry.get(['a', 'b'])).toEqual(2)
    expect(registry.get(['a', 'c'])).toEqual(1)
    expect(registry.get(['a', 'c', 'b'])).toEqual(1)
    expect(registry.get(['a', 'b', 'c'])).toEqual(2)
  })

  it('it allows the empty list as a key, (effectively used as default value)', () => {
    registry.register([], -1)
    registry.register(['x'], 1)

    expect(registry.get([])).toEqual(-1)
    expect(registry.get('xyz')).toEqual(-1)
    expect(registry.get('x')).toEqual(1)
    expect(registry.get(['x', 'y'])).toEqual(1)
    expect(registry.get(['y', 'x'])).toEqual(-1)
  })

  it('forgets older registrations', () => {
    registry.register('x', 1)
    registry.register('x', 2)

    expect(registry.get('x')).toEqual(2)
  })
})
