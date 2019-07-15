'use strict'

import { props, ext, modify, using, named } from '../extensions'

describe('Extension', () => {
  const s = Symbol('s')

  describe('DSL combinators', () => {
    describe('ext', () => {
      test('basic building block of an extension', () => {
        const s = Symbol('s')
        const n = Symbol('n')

        const f = () => ({})

        expect(() => ext('foo', 1)).toThrow()
        expect(() => ext(s, 1)).toThrow()

        expect(ext(s, f)).toEqual({
          [props.extOf]: s,
          [props.extFactory]: f,
        })

        expect(ext([s, n], f)).toEqual({
          [props.extOf]: [s, n],
          [props.extFactory]: f,
        })
      })
    })

    test('modify', () => {
      const e = () => {}
      const x = ext(s, e)
      const forKind = (kind, exts) => modify('kind', () => kind, exts)

      expect(forKind('foo', x)).toEqual({
        kind: 'foo',
        [props.extOf]: s,
        [props.extFactory]: e,
      })

      expect(forKind('foo', [x])).toEqual([
        {
          kind: 'foo',
          [props.extOf]: s,
          [props.extFactory]: e,
        },
      ])
    })

    test('using', () => {
      const a = Symbol('a')
      const b = Symbol('b')
      const foo = Symbol('foo')

      const x = ext(s, () => {})
      const withDeps = using({ a: a, b: [b] }, x)

      expect(using({ a: foo }, x)[props.deps]).toMatchObject({
        a: {
          [props.extOf]: foo,
          [props.one]: true,
        },
      })
      expect(using({ a: foo }, withDeps)[props.deps]).toMatchObject({
        a: {
          [props.extOf]: foo,
          [props.one]: true,
        },
        b: {
          [props.extOf]: b,
          [props.one]: false,
        },
      })
    })

    test('named', () => {
      const name = Symbol('name')
      const f = () => ({})

      const x = ext(s, f)
      const x2 = ext(s, f)

      expect(named(name, x)).toEqual({
        [props.extOf]: [s, name],
        [props.extFactory]: f,
      })

      expect(named(name, [x, x2])).toEqual([
        {
          [props.extOf]: [s, name],
          [props.extFactory]: f,
        },
        {
          [props.extOf]: [s, name],
          [props.extFactory]: f,
        },
      ])
    })
  })
})
