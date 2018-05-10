'use strict'

import ExtensionSlot, { collect, idOf } from '../extensions'

describe('Extensions', () => {
  describe('ExtensionSlot', () => {
    describe('Defining ExtensionSlots', () => {
      test('edge cases', () => {
        expect(() => ExtensionSlot()).toThrow()
        expect(() => ExtensionSlot(3)).toThrow()
        expect(() => ExtensionSlot([3])).toThrow()
        expect(() => ExtensionSlot({})).toThrow()
      })

      test('declaring extension slots', () => {
        const slot = ExtensionSlot(() => {
          let numbers = []

          return {
            addNumber(n) {
              numbers.push(n)
            },

            collect() {
              return { numbers }
            },
          }
        })

        const obj = {}
        const extension = slot(obj)

        extension.addNumber(3)

        expect(extension.collect()).toEqual({ numbers: [3] })
      })

      test('at most one extension per unit', () => {
        const unit = {}
        const unit2 = function() {}
        const slot = ExtensionSlot(() => ({ collect() {} }))

        const extension = slot(unit)
        const extension2 = slot(unit)
        const extenison3 = slot(unit2)

        expect(extension).toBe(extension2)
        expect(extension).not.toBe(extenison3)
      })

      test('extension slot fns must return an object with a collect() fn', () => {
        expect(() => {
          const slot = ExtensionSlot(() => null)
          slot({})
        }).toThrow()

        expect(() => {
          const slot = ExtensionSlot(() => 2)
          slot({})
        }).toThrow()

        expect(() => {
          const slot = ExtensionSlot(() => [12])
          slot({})
        }).toThrow()

        expect(() => {
          const slot = ExtensionSlot(() => ({ wrongName() {} }))
          slot({})
        }).toThrow()

        expect(() => {
          const slot = ExtensionSlot(() => ({ collect() {} }))
          slot({})
        }).not.toThrow()
      })
    })

    describe('Collecting extensions', () => {
      const slot = ExtensionSlot(() => {
        let numbers = []

        return {
          add(n) {
            numbers.push(n)
          },
          collect() {
            return {
              numbers,
            }
          },
        }
      })

      test('edge cases', () => {
        const ss = {}
        expect(() => collect(null, ss)).toThrow()
        expect(() => collect(2, ss)).toThrow()
        expect(() => collect('something', ss)).toThrow()
        expect(() => collect([], ss)).toThrow()

        expect(collect(slot, null)).toEqual([])
        expect(collect(slot, undefined)).toEqual([])
        expect(collect(slot, ss)).toEqual([])
      })

      test('collectted values', () => {
        const ss = {}

        const ext = slot(ss)

        ext.add(3)
        ext.add(4)

        expect(collect(slot, ss)[0]).toMatchObject({ numbers: [3, 4] })
        expect(idOf(collect(slot, ss)[0])).toEqual(expect.any(String))
      })
    })
  })
})
