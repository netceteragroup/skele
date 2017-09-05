'use strict'

import R from 'ramda'
import * as SubSystem from '../subsystem'

// required subsystems

import '../transform'

import { PatternRegistry, RegistryChain } from '../registry'

import { createSagaMiddleware } from 'redux-saga'

// TODO move to coreSubSystem

// register default read elements
import './elements/read'
import './elements/loading'
import './elements/error'
import './elements/container'

import * as impl from './impl'
import * as http from './http'

const fallback = '@@girders-elements/_defaultRead'
const registryAttribute = '@@girders-elements/_readRegistry'

/**
 * Extension point for defining reads
 */
SubSystem.extend(() => {
  const readRegistry = new PatternRegistry()
  return {
    read: {
      [registryAttribute]: readRegistry,

      /**
       * registers a new read in the subystem.
       */
      register: readRegistry.register.bind(readRegistry),

      /**
       * symbol identifying the fallback read. Use it to register a fallback read
       *
       *     read.register(read.fallback, read.httpRead);
       *
       */
      default: fallback,
      fallback,

      /**
       * HTTP methods
       */
      http,
    },
  }
})

export default (readSubsystem = SubSystem.create(system => {
  // prepare the saga middleware (this may ba a separate subsystem)
  const sagaMiddleware = createSagaMiddleware()
  sagaMiddleware.run(impl.watchReadPerform)

  return {
    reducer: impl.reducer(
      buildRegistry(system.subsystems),
      system.subsystems.transform.buildTransformer()
    ),
    middleware: sagaMiddleware,
    http,
  }
}))

const getRegistry = R.prop(registryAttribute)
const getRegistries = R.pipe(R.map(getRegistry), R.reject(R.isNil))

function buildRegistry(subsystems) {
  const registries = getRegistries(subsystems)

  return R.count(registries) === 0
    ? new PatternRegistry()
    : R.count(registries) === 1
      ? registries[0]
      : R.reduce(
          (combined, r) => new RegistryChain(combined, r),
          registries[0],
          registries
        )
}
