'use strict'

import Trie from '../Trie'

describe('Trie', () => {
  let trie

  beforeEach(() => (trie = new Trie()))

  it('can be used as normal map', () => {
    expect(trie.get(undefined)).toBeUndefined()
    expect(trie.get(null)).toBeUndefined()
    expect(trie.get('foo')).toBeUndefined()

    trie.register('foo', 'bar')
    trie.register(1, 'one')

    expect(trie.get('foo')).toEqual('bar')
    expect(trie.get(1)).toEqual('one')
    expect(trie.get(2)).toBeUndefined()
    expect(trie.get('bar')).toBeUndefined()
  })

  it('treats x and [x] as equvialent', () => {
    expect(trie.get('x')).toBeUndefined()
    expect(trie.get(['x'])).toBeUndefined()

    trie.register(['x'], 'bar')

    expect(trie.get('x')).toEqual('bar')
    expect(trie.get(['x'])).toEqual('bar')
    expect(trie.get('y')).toBeUndefined()
    expect(trie.get(['y'])).toBeUndefined()
  })

  describe('lookups', () => {
    beforeEach(() => {
      trie.register([], 'rootVal')
      trie.register(['foo', 'bar', 'baz'], 'bazVal')
      trie.register(['foo', 'bar'], 'barVal')
      trie.register('x', 'xVal')
      trie.register([1, 'two'], 'oneTwoVal')
    })

    test('exact lookup', () => {
      expect(trie.get([])).toEqual('rootVal')
      expect(trie.get(['foo', 'bar'])).toEqual('barVal')
      expect(trie.get(['foo', 'bar', 'baz'])).toEqual('bazVal')
      expect(trie.get(['x'])).toEqual('xVal')
      expect(trie.get([1, 'two'])).toEqual('oneTwoVal')

      expect(trie.get('foo')).toBeUndefined()
      expect(trie.get('foo', false)).toBeUndefined()
    })

    test('best match lookup', () => {
      expect(trie.get([], true)).toEqual('rootVal')
      expect(trie.get('foo', true)).toEqual('rootVal')
      expect(trie.get(['foo', 'x'], true)).toEqual('rootVal')
      expect(trie.get(['foo', 'bar'], true)).toEqual('barVal')
      expect(trie.get(['foo', 'bar', 'y', 'z'], true)).toEqual('barVal')
      expect(trie.get(['foo', 'bar', 'baz'], true)).toEqual('bazVal')
      expect(trie.get(['foo', 'bar', 'baz', 'x'], true)).toEqual('bazVal')
      expect(trie.get(['x'])).toEqual('xVal')
      expect(trie.get(['x', 'y', 1, 2], true)).toEqual('xVal')
    })
  })
})
