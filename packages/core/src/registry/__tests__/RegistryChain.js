'use strict'

import { List } from 'immutable'
import {
  RegistryChain,
  MultivalueRegistryChain,
  chainRegistries,
  chainMultivalueRegistries,
} from '../RegistryChain'

import Registry from '../Registry'
import MultivalueRegistry from '../MultivalueRegistry'
import PatternRegistry from '../PatternRegistry'

describe('RegistryChain', () => {
  const reg1 = new Registry()
  const reg2 = new Registry()
  const combined = new RegistryChain(reg1, reg2)

  afterEach(() => {
    reg1.reset()
    reg2.reset()
  })

  it('chains two repositories together', () => {
    reg1.register('a', 1)
    reg2.register('b', 2)

    expect(combined.get('a')).toEqual(1)
    expect(combined.get('b')).toEqual(2)
  })

  it('gives precedence to the primary registry', () => {
    reg1.register('a', 1)
    reg2.register('a', 2)

    expect(combined.get('a')).toEqual(2)
  })

  it('looks for the more specific version of the key in both registries first', () => {
    reg1.register(['a', 'b'], 1)
    reg2.register('a', 2)

    expect(combined.get(['a', 'b'])).toEqual(1)
  })
})

describe('RegistryChain with a fallabck pattern registry', () => {
  const reg1 = new PatternRegistry()
  const reg2 = new Registry()
  const combined = new RegistryChain(reg1, reg2)

  afterEach(() => {
    reg1.reset()
    reg2.reset()
  })

  it('supports more/less specific keys as well as patterns', () => {
    reg1.register(/^ab/, 1)
    reg2.register(['ab', 'a'], 2)

    expect(combined.get(['ab', 'a'])).toEqual(2)
    expect(combined.get('ab')).toEqual(1)
  })
})

describe('MultivalueRegistryChain', () => {
  const reg1 = new MultivalueRegistry()
  const reg2 = new MultivalueRegistry()
  const combined = new MultivalueRegistryChain(reg1, reg2)

  afterEach(() => {
    reg1.reset()
    reg2.reset()
  })

  it('combines results, less specific to more, fallback to primary, from both registries', () => {
    reg2.register('a', 1)
    reg1.register(['a', 'b'], 2)
    reg1.register(['a', 'b', 'c'], 3)
    reg1.register('a', 4)
    reg1.register(['a', 'b'], 5)
    reg2.register(['a', 'b', 'c'], 10)

    expect(combined.get('a')).toEqualI(List.of(4, 1)) // fallback, to primary
    expect(combined.get(['a', 'b'])).toEqualI(List.of(4, 1, 2, 5))
    expect(combined.get(['a', 'b', 'c'])).toEqualI(List.of(4, 1, 2, 5, 3, 10))
  })
})

describe('chainRegistries', () => {
  const reg1 = new PatternRegistry()
  const reg2 = new Registry()
  const reg3 = new Registry()
  const reg4 = new Registry()

  afterEach(() => {
    reg1.reset()
    reg2.reset()
    reg3.reset()
    reg4.reset()
  })

  it('combines several registries, where registries to the right have precedence', () => {
    const combined = chainRegistries([reg1, reg2, reg3, reg4])

    reg1.register('a', 1)
    reg4.register('a', 3)
    reg2.register('b', 6)

    expect(combined.get('a')).toEqual(3)
    expect(combined.get('b')).toEqual(6)
  })
})

describe('chainMultivalueRegistries', () => {
  const reg1 = new MultivalueRegistry()
  const reg2 = new MultivalueRegistry()
  const reg3 = new MultivalueRegistry()
  const reg4 = new MultivalueRegistry()

  afterEach(() => {
    reg1.reset()
    reg2.reset()
    reg3.reset()
    reg4.reset()
  })

  it('combines several registries, where registries to the right have precedence', () => {
    const combined = chainMultivalueRegistries([reg1, reg2, reg3, reg4])

    reg1.register('a', 1)
    reg3.register('a', 2)
    reg2.register(['a', 'b'], 3)
    reg4.register(['a', 'b'], 4)

    expect(combined.get(['a', 'b'])).toEqualI(List.of(1, 2, 3, 4))
  })
})
