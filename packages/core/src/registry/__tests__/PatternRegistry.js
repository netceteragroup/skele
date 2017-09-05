'use strict'

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
})
