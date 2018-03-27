'use strict'

import Unit, { start, stop, unitMeta, updateUnitMeta } from '../unit'

describe('Unit', () => {
  describe('defining units', () => {
    test('Using an object definition', () => {
      const def = Unit({
        hello: 'world',
      })

      const inst = def()

      expect(inst.hello).toEqual('world')
    })

    test('Using function definition', () => {
      const def = Unit(() => ({
        hello: 'world',
      }))

      const inst = def()
      expect(inst.hello).toEqual('world')
    })
  })

  describe('lifecycle', () => {
    test('starting', () => {
      const def = Unit({
        start: jest.fn(),
      })

      const inst = def()
      start(inst)

      expect(inst.start).toHaveBeenCalled()
    })

    test('start method optional', () => {
      const def = Unit({
        hello: jest.fn(),
      })

      const inst = def()
      expect(() => {
        start(inst)
      }).not.toThrow()
    })

    test('stopping', () => {
      const def = Unit({
        start: jest.fn(),
      })

      const inst = def()
      start(inst)

      expect(inst.start).toHaveBeenCalled()
    })

    test('stop method optional', () => {
      const def = Unit({
        hello: jest.fn(),
      })

      const inst = def()
      expect(() => {
        start(inst)
      }).not.toThrow()
    })
  })

  describe('dependencies', () => {
    test('dependecies with non/fn unit are ignore', () => {
      const def = Unit({
        hello: 'world',
      })

      let inst
      expect(() => {
        inst = def({ dependency: 'string' })
      }).not.toThrow()

      expect(inst.hello).toEqual('world')
    })

    test('are passed in as named props of the first argument', () => {
      const def = Unit(({ dependency }) => ({
        hello: () => `Hello ${dependency}`,
      }))

      const inst = def({ dependency: 'World' })

      expect(inst.hello()).toEqual('Hello World')
    })
  })

  describe('metadata', () => {
    test('edge cases', () => {
      expect(unitMeta(null)).toEqual({})
      expect(unitMeta(undefined)).toEqual({})
      expect(unitMeta([])).toEqual({})
      expect(unitMeta({})).toEqual({})
    })

    test('reading and writing', () => {
      const s = Unit({})

      updateUnitMeta(m => ({ ...m, instance: true }), s)
      expect(unitMeta(s)).toEqual({
        instance: true,
      })
    })
  })
})
