'use strict'

import * as SubSystem from '../subsystem'
import * as Kernel from '../kernel'

import { List } from 'immutable'

describe('SubSystem', () => {
  afterEach(() => SubSystem.resetExtensions())

  describe('Declaring SubSystems', () => {
    let sub1 = SubSystem.create(() => ({
      name: 'sub1',
      hello() {
        return 'hello from sub1'
      },
    }))

    let sub2 = SubSystem.create(system => ({
      name: 'sub2',

      hello() {
        return List.of(system.subsystems.sub1.hello(), 'hello from sub 2')
      },
    }))

    let k = Kernel.create({}, [sub1, sub2], {})

    it('allows subsystems to talk to eachother (late binding)', () => {
      expect(k.subsystems.sub2.hello()).toEqualI(
        List.of('hello from sub1', 'hello from sub 2')
      )
    })
  })

  describe('Extensions', () => {
    SubSystem.extend(() => {
      const registry = []

      return {
        read: {
          registry: registry,

          register(x) {
            registry.push(x)
          },
        },
      }
    })

    let sub1 = SubSystem.create(() => ({
      name: 'sub1',
      hello() {
        return 'hello from sub1'
      },
    }))

    let sub2 = SubSystem.create(system => ({
      name: 'sub2',

      hello() {
        return List.of(system.subsystems.sub1.hello(), 'hello from sub 2')
      },
    }))

    it('allows for extension points and registrations', () => {
      sub1.read.register(1)
      sub2.read.register(2)

      let k = Kernel.create({}, [sub1, sub2], {})

      expect(k.subsystems.sub1.read.registry).toEqual([1])
      expect(k.subsystems.sub2.read.registry).toEqual([2])
    })
  })
})
