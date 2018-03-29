'use strict'

import System, { Subsystem, using, after, contributions } from '../system'
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

  test('starting and stopping a system, starts all units inside', () => {
    const sys = System({
      withStart: Unit({
        start: jest.fn(),
      }),

      withStop: Unit({
        stop: jest.fn(0),
      }),

      withNothing: Unit({}),
    })

    sys.start()

    expect(sys.withStart.start).toHaveBeenCalled()
    expect(sys.withStop.stop).not.toHaveBeenCalled()

    sys.withStart.start.mockClear()
    sys.withStop.stop.mockClear()

    sys.stop()

    expect(sys.withStart.start).not.toHaveBeenCalled()
    expect(sys.withStop.stop).toHaveBeenCalled()
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

describe('Subsystem', () => {
  test('Subsystems are systems that can be used as units within onther systems or subsystems (composition)', () => {
    const sub1 = Subsystem({
      u1: sampleUnit('prop1'),
    })

    const sub2 = Subsystem(() => ({
      u3: sampleUnit('prop3'),
      s1: sub1,
    }))

    const sys = System({
      sub2: sampleUnit('prop2'),
      s1: sub1,
      s2: sub2,
    })

    const sys2 = System({
      s1: sub1(),
      s2: sub2(),
    })

    expect(sys.s1.u1.prop1).toEqual(true)
    expect(sys.s2.u3.prop3).toEqual(true)
    expect(sys.s2.s1.u1.prop1).toEqual(true)
    expect(sys.s1).not.toBe(sys.s2.s1)

    expect(sys2.s1.u1.prop1).toEqual(true)
    expect(sys2.s2.u3.prop3).toEqual(true)
  })

  test('Subsystems can also be used as standalone systems', () => {
    const def = {
      u1: sampleUnit('prop1'),
    }

    expect(Subsystem(def)()).toEqual(System(def))
    expect(System(Subsystem(def))).toEqual(System(def))
  })

  describe('dependencies', () => {
    const unit = dependentUnit('inj', 'inj')
    const simple = sampleUnit('sampleProp')

    const subsystem = Subsystem(({ dependency }) => ({
      imported: dependency,
      unit: using({ inj: dependency }, unit),
      simple,
    }))

    test('Subsystems can be used as a dependency (like a unit)', () => {
      const sys = subsystem({ dependency: 22 })

      expect(sys.imported).toEqual(22)
      expect(sys.unit.inj).toEqual(22)
    })

    test('using() can be used on subsystems (like units)', () => {
      const unit2 = sampleUnit('xy')

      const sys = System({
        sub1: using({ dependency: 'unit2' }, subsystem),
        unit2,
      })

      expect(sys.sub1.imported.xy).toBe(true)
      expect(sys.sub1.unit.inj.xy).toBe(true)
    })

    test('a unit from within a Subsystem can be used as a dependency in the outer system', () => {
      const unit2 = dependentUnit('inj', 'inj')

      const sys = System({
        unit2: using({ inj: ['subsystem', 'simple'] }, unit2),
        subsystem: using({ dependency: 'dummy' }, subsystem),
        dummy: {},
      })

      expect(sys.unit2.inj.sampleProp).toBe(true)
    })
  })

  test('systems and subsystems cannot have members with names `start` and `stop`', () => {
    expect(() => {
      System({
        start: Unit({}),
      })
    }).toThrowError("You can't have a part of the system called `start`")

    expect(() => {
      System({
        stop: Unit({}),
      })
    }).toThrowError(/You can't have a part of the system called `stop`/)
  })
})
