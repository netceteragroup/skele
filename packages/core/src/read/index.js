'use strict'

import R from 'ramda'
import invariant from 'invariant'

// required subsystems
import * as SubSystem from '../subsystem'
import '../enrich'
import '../transform'

import { PatternRegistry, chainRegistries } from '../registry'
import createSagaMiddleware from 'redux-saga'

import * as impl from './impl'
import * as http from './http'

const registryAttribute = '@@girders-elements/_readRegistry'
const fallback = impl.fallback

/**
 * Extension point for defining reads
 */
SubSystem.extend(() => {
  const readRegistry = new PatternRegistry()

  return {
    read: {
      [registryAttribute]: readRegistry,

      /**
       * registers a new read in the subsystem.
       */
      register: readRegistry.register.bind(readRegistry),

      reset: readRegistry.reset.bind(readRegistry),

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

export default SubSystem.create((system, instantiatedSubsystems) => {
  invariant(
    instantiatedSubsystems.transform != null,
    'The read subsystem depends on the transform subsystem.' +
      'You must place it in the subsystem list **before** the read.'
  )

  const registry = getCombinedRegistry(system.subsystemSequence)
  const enrichment = instantiatedSubsystems.enrich.buildEnricher()
  const transformation = instantiatedSubsystems.transform.buildTransformer()

  const config = { registry, enrichment, transformation, kernel: system }

  // prepare the saga middleware (this may ba a separate subsystem)
  const sagaMiddleware = createSagaMiddleware()

  return {
    name: 'read',

    reducer: impl.reducer(config),
    middleware: sagaMiddleware,

    start() {
      sagaMiddleware.run(impl.watchReadPerform(config))
    },
  }
})

const getRegistry = R.path(['read', registryAttribute])

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainRegistries
)
