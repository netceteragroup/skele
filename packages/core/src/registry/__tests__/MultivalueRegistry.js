'use strict'

import MultivalueRegistry from '../MultivalueRegistry'

import { List } from 'immutable'

describe('MultivalueRegistry', () => {
  const registry = new MultivalueRegistry()

  afterEach(() => registry.reset())

  it('returns empty lists for missing keys', () => {
    expect(registry.get('a')).toEqualI(List())
  })

  it('collects all registered values for a key', () => {
    registry.register('a', 1)
    registry.register('a', 2)

    expect(registry.get('a')).toEqualI(List.of(1, 2))
  })

  it('prepends matching values of lesser specificity to the result', () => {
    registry.register('a', 1)
    registry.register(['a', 'b'], 2)
    registry.register(['a', 'b'], 20)
    registry.register(['a', 'b', 'c'], 3)
    registry.register('a', 4)
    registry.register(['a', 'b'], 5)

    expect(registry.get('a')).toEqualI(List.of(1, 4))
    expect(registry.get(['a', 'b'])).toEqualI(List.of(1, 4, 2, 20, 5))
    expect(registry.get(['a', 'b', 'c'])).toEqualI(List.of(1, 4, 2, 20, 5, 3))
  })
})
