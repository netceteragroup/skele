'use strict'

import System, { using, after, contributions } from '../system'
import Unit from '../unit'
import ExtensionSlot from '../extensions'

const sampleUnit = prop => Unit({ [prop]: true })

const dependentUnit = (dep, prop) =>
  Unit(deps => ({
    [prop]: deps[dep],
  }))

describe('System', () => {
  test('simple system, accewssing units', () => {
    const unit1 = sampleUnit('prop1')
    const unit2 = sampleUnit('prop2')

    const system = System({
      unit1: unit1(),
      unit2: unit2(),
    })

    expect(system.unit1.prop1).toEqual(true)
    expect(system.unit2.prop2).toEqual(true)
  })

  test('a unit can be a plain object', () => {
    const system = System({
      unit: {
        prop1: true,
      },
    })

    expect(system.unit.prop1).toEqual(true)
  })

  test('a unit can be a function returning an object', () => {
    const system = System({
      unit() {
        return {
          prop1: true,
        }
      },
    })

    expect(system.unit.prop1).toEqual(true)
  })

  test('shorthand: since instantiating is actually "calling it":', () => {
    const unit1 = sampleUnit('prop1')
    const unit2 = sampleUnit('prop2')

    const system = System({ unit1, unit2 })

    expect(system.unit1.prop1).toEqual(true)
    expect(system.unit2.prop2).toEqual(true)
  })

  describe('dependencies', () => {
    test('named dependency', () => {
      const unit1 = sampleUnit('prop1')
      const unit2 = dependentUnit('dep1', 'prop2')

      const system = System({
        unit2: using({ dep1: 'unit1' }, unit2),
        unit1,
      })

      expect(system.unit2.prop2.prop1).toEqual(true)
    })

    test('dependency name and unit name are the same', () => {
      const unit1 = sampleUnit('prop1')
      const unit2 = dependentUnit('unit1', 'prop2')

      const system = System({
        unit2: using(['unit1'], unit2),
        unit1,
      })

      expect(system.unit2.prop2.prop1).toEqual(true)
    })

    test('throws in case of an unsatisfied dependency (we could relax this, I guess?)', () => {
      const unit = dependentUnit('unit1', 'prop2')

      expect(() => {
        System({
          unit: using(['unit1'], unit),
        })
      }).toThrow(
        "Unsatisfied dependency 'unit1' of unit 'unit'. Unit 'unit1' not found."
      )
    })

    test('circular dependencies are not allwed', () => {
      const unit1 = dependentUnit('dep', 'prop1')
      const unit2 = dependentUnit('unit1', 'prop2')
      const unit3 = dependentUnit('unit2', 'prop3')
      const unit4 = dependentUnit('unit1', 'prop4')

      expect(() => {
        System({
          unit1: using({ dep: 'unit3' }, unit1),
          unit2: using(['unit1'], unit2),
          unit3: using(['unit2'], unit3),
          unit4: using(['unit1'], unit4),
        })
      }).toThrow(
        'Circular dependency (->: depends on): unit1 -> unit3 -> unit2 -> unit1'
      )
    })
  })

  describe('contributions', () => {
    const numbersSlot = ExtensionSlot(() => {
      let numbers = []
      return {
        add(n) {
          numbers.push(n)
        },
        collect() {
          return { numbers }
        },
      }
    })

    const numberCollector = Unit(({ numbers }) => ({
      collected: numbers.map(e => e.numbers).reduce((a, v) => a.concat(v), []),
    }))
    const unit1 = Unit({})
    const unit2 = Unit({})
    const unit3 = Unit(() => {})

    numbersSlot(unit1).add(1)
    numbersSlot(unit1).add(3)

    numbersSlot(unit3).add(10)

    test('collects contributions from all contributing systems', () => {
      const system = System({
        numberCollector: using(
          { numbers: contributions(numbersSlot) },
          numberCollector
        ),
        unit1: using(['unit3'], unit1),
        unit3: using(['numberCollector'], unit3),
        unit2: using(['unit1'], unit2),
      })

      expect(system.numberCollector.collected).toEqual([10, 1, 3])
    })
  })
  describe('ordering', () => {
    test('a system can be sepcified using a list of tuples', () => {
      const unit1 = sampleUnit('prop1')
      const unit2 = dependentUnit('dep1', 'prop2')

      const system = System([
        ['unit2', using({ dep1: 'unit1' }, unit2)],
        ['unit1', unit1],
      ])

      expect(system.unit2.prop2.prop1).toEqual(true)
    })

    test('`after` can be used instead of `using` to signify ordering importance', () => {
      const unit1 = sampleUnit('prop1')
      const unit2 = dependentUnit('unit1', 'prop2')

      const system = System({
        unit2: after(['unit1'], unit2),
        unit1,
      })
      expect(system.unit2.prop2.prop1).toEqual(true)
    })
  })
})
