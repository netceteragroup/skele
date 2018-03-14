'use strict'

import System, { using } from '../system'
import Subsystem from '../subsystem'

const sampleSubsystem = prop => Subsystem({ [prop]: true })

const dependentSubsystem = (dep, prop) =>
  Subsystem(deps => ({
    [prop]: deps[dep],
  }))

describe('System', () => {
  test('simple system, accewssing subsystems', () => {
    const sub1 = sampleSubsystem('prop1')
    const sub2 = sampleSubsystem('prop2')

    const system = System({
      sub1: sub1(),
      sub2: sub2(),
    })

    expect(system.subsystems.sub1.prop1).toEqual(true)
    expect(system.subsystems.sub2.prop2).toEqual(true)
  })

  test('a subsystem can be a plain object', () => {
    const system = System({
      sub: {
        prop1: true,
      },
    })

    expect(system.subsystems.sub.prop1).toEqual(true)
  })

  test('a subsystem can be a function returning an object', () => {
    const system = System({
      sub() {
        return {
          prop1: true,
        }
      },
    })

    expect(system.subsystems.sub.prop1).toEqual(true)
  })

  test('shorthand: since instantiating is actually "calling it":', () => {
    const sub1 = sampleSubsystem('prop1')
    const sub2 = sampleSubsystem('prop2')

    const system = System({ sub1, sub2 })

    expect(system.subsystems.sub1.prop1).toEqual(true)
    expect(system.subsystems.sub2.prop2).toEqual(true)
  })

  describe('dependencies', () => {
    test('named dependency', () => {
      const sub1 = sampleSubsystem('prop1')
      const sub2 = dependentSubsystem('dep1', 'prop2')

      const system = System({
        sub2: using({ dep1: 'sub1' }, sub2),
        sub1,
      })

      expect(system.subsystems.sub2.prop2.prop1).toEqual(true)
    })

    test('dependency name and subsystem name are the same', () => {
      const sub1 = sampleSubsystem('prop1')
      const sub2 = dependentSubsystem('sub1', 'prop2')

      const system = System({
        sub2: using(['sub1'], sub2),
        sub1,
      })

      expect(system.subsystems.sub2.prop2.prop1).toEqual(true)
    })

    test('throws in case of an unsatisfied dependency (we could relax this, I guess?)', () => {
      const sub = dependentSubsystem('sub1', 'prop2')

      expect(() => {
        System({
          sub: using(['sub1'], sub),
        })
      }).toThrow(
        "Unsatisfied dependency 'sub1' of subsystem 'sub'. Subsystem 'sub1' not found."
      )
    })

    test('circular dependencies are not allwed', () => {
      const sub1 = dependentSubsystem('dep', 'prop1')
      const sub2 = dependentSubsystem('sub1', 'prop2')
      const sub3 = dependentSubsystem('sub2', 'prop3')
      const sub4 = dependentSubsystem('sub1', 'prop4')

      expect(() => {
        System({
          sub1: using({ dep: 'sub3' }, sub1),
          sub2: using(['sub1'], sub2),
          sub3: using(['sub2'], sub3),
          sub4: using(['sub1'], sub4),
        })
      }).toThrow(
        'Circular dependency (->: depends on): sub1 -> sub3 -> sub2 -> sub1'
      )
    })
  })
})
