'use strict'

import { List } from 'immutable'

import PatternRegistry from '../PatternRegistry'

describe('PatternRegistry', () => {
  const registry = new PatternRegistry()

  afterEach(() => registry.reset())

  it('allows predicate functions as keys', () => {
    registry.register(k => k.startsWith('ab'), 1)

    expect(registry.get('c')).toBeUndefined()
    expect(registry.get('abc')).toEqual(1)
  })

  it('allows regular expressions for patterns', () => {
    registry.register(/^http:/, 4)

    expect(registry.get(44)).toBeUndefined()
    expect(registry.get('http://example.com')).toEqual(4)
  })

  it('allows any other value, to be used (like a map, only slower)', () => {
    registry.register(22, 4)
    registry.register('http://example.com', 5)
    registry.register([1, 2], 6)
    registry.register(List.of(1, 2), 7)

    expect(registry.get(22)).toEqual(4)
    expect(registry.get('http://example.com')).toEqual(5)
    expect(registry.get([1, 2])).toEqual(6)
    expect(registry.get(List.of(1, 2))).toEqual(7)
  })
})
