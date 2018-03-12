'use strict'

import Subsystem, { start, stop } from '../subsystem'

describe('Subsystem', () => {
  describe('defining subsystems', () => {
    test('Using an object definition', () => {
      const def = Subsystem({
        hello: 'world',
      })

      const inst = def()

      expect(inst.hello).toEqual('world')
    })

    test('Using function definition', () => {
      const def = Subsystem(() => ({
        hello: 'world',
      }))

      const inst = def()
      expect(inst.hello).toEqual('world')
    })
  })

  describe('lifecycle', () => {
    test('starting', () => {
      const def = Subsystem({
        start: jest.fn(),
      })

      const inst = def()
      start(inst)

      expect(inst.start).toHaveBeenCalled()
    })

    test('start method optional', () => {
      const def = Subsystem({
        hello: jest.fn(),
      })

      const inst = def()
      expect(() => {
        start(inst)
      }).not.toThrow()
    })

    test('stopping', () => {
      const def = Subsystem({
        start: jest.fn(),
      })

      const inst = def()
      start(inst)

      expect(inst.start).toHaveBeenCalled()
    })

    test('stop method optional', () => {
      const def = Subsystem({
        hello: jest.fn(),
      })

      const inst = def()
      expect(() => {
        start(inst)
      }).not.toThrow()
    })
  })

  describe('dependencies', () => {
    test('dependecies with non/fn subsystem are ignore', () => {
      const def = Subsystem({
        hello: 'world',
      })

      let inst
      expect(() => {
        inst = def({ dependency: 'string' })
      }).not.toThrow()

      expect(inst.hello).toEqual('world')
    })

    test('are passed in as named props of the first argument', () => {
      const def = Subsystem(({ dependency }) => ({
        hello: () => `Hello ${dependency}`,
      }))

      const inst = def({ dependency: 'World' })

      expect(inst.hello()).toEqual('Hello World')
    })
  })
})
