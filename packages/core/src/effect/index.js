'use strict'

import R from 'ramda'
import invariant from 'invariant'

import { chainRegistries, ActionRegistry } from '../registry'
import * as data from '../data'
import * as Subsystem from '../subsystem'

import * as impl from './impl'

const effectsRegistryAttribute = '@@girders-elements/_effectsRegistry'
const sideEffectsRegistryAttribute = '@@girders-elements/_sideEffectsRegistry'

Subsystem.extend(() => {
  const effectsRegistry = new ActionRegistry()
  const sideEffectsRegistry = new ActionRegistry()

  const register = R.curry((registry, kind, action, effect) => {
    invariant(
      data.isElementRef(kind),
      'You must provide a valid element reference to register'
    )

    invariant(typeof action === 'string', 'The action must be a string')
    invariant(typeof effect === 'function', 'the effect must be a function')

    registry.register(ActionRegistry.keyFor(kind, action), effect)
  })

  const forKind = R.curry((registry, kind, registrations) => {
    invariant(
      typeof registrations === 'function',
      'You must provide a registrations block'
    )
    registrations({ register: register(registry, kind) })
  })

  return {
    effect: {
      [effectsRegistryAttribute]: effectsRegistry,

      register: register(effectsRegistry),

      forKind: forKind(effectsRegistry),
    },

    sideEffect: {
      [sideEffectsRegistryAttribute]: sideEffectsRegistry,

      register: register(sideEffectsRegistry),

      forKind: forKind(sideEffectsRegistry),
    },
  }
})

export default Subsystem.create(system => {
  const config = {
    effectsRegistry: getCombinedRegistry(
      ['effect', effectsRegistryAttribute],
      system.subsystemSequence
    ),

    sideEffectsRegistry: getCombinedRegistry(
      ['sideEffect', sideEffectsRegistryAttribute],
      system.subsystemSequence
    ),

    kernel: system,
  }

  return {
    name: 'effects',

    middleware: impl.middleware(config),
    reducer: impl.reducer(config),
  }
})

const getRegistry = R.path

const getCombinedRegistry = R.curry((path, subsystems) =>
  data.flow(
    subsystems,
    R.map(getRegistry(path)),
    R.reject(R.isNil),
    chainRegistries
  )
)
