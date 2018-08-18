'use strict'

import * as R from 'ramda'
import invariant from 'invariant'

import { data, registry, log } from '@skele/core'
import { ActionRegistry } from '../registry'
import * as Subsystem from '../subsystem'

import * as impl from './impl'

const registryAttribute = '@@skele/_updateRegistry'

const { chainRegistries } = registry
const { deprecated } = log

Subsystem.extend(() => {
  const reg = new ActionRegistry()

  const _register = R.curry((kind, action, update) => {
    invariant(
      data.isElementRef(kind),
      'You must provide a valid element reference to register'
    )

    invariant(
      typeof action === 'string',
      `The action must be a string: ${action}`
    )
    invariant(typeof update === 'function', 'the update must be a function')

    reg.register(ActionRegistry.keyFor(kind, action), update)
  })

  const forKind = R.curry((kind, registrations) => {
    invariant(
      typeof registrations === 'function',
      'You must provide a registrations block'
    )
    registrations({ register: _register(kind) })
  })

  const oldRegister = deprecated(
    'Using update.register(kind, registrations) is deprecated. ' +
      'Please use update.forKind() for this syntax.',
    forKind
  )

  return {
    update: {
      [registryAttribute]: reg,

      forKind,

      register(kind, action, update) {
        if (update == null && typeof action === 'function') {
          const registrations = action

          oldRegister(kind, registrations)
        } else {
          _register(kind, action, update)
        }
      },
    },
  }
})

export default Subsystem.create(system => {
  const config = {
    registry: getCombinedRegistry(system.subsystemSequence),
  }
  return {
    name: 'update',

    reducer: impl.reducer(config),
  }
})

const getRegistry = R.path(['update', registryAttribute])
const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainRegistries
)
