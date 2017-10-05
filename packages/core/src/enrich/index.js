'use strict'

import R from 'ramda'
import invariant from 'invariant'

import { isElementRef } from '../data'

import * as SubSystem from '../subsystem'
import { MultivalueRegistry, chainMultivalueRegistries } from '../registry'

import * as impl from './impl'

const registryAttribute = '@@girders-elements/_enrichRegistry'

SubSystem.extend(() => {
  const registry = new MultivalueRegistry()

  return {
    enrich: {
      [registryAttribute]: registry,

      /**
       * Registers an enricher for the specific kind
       */
      register(kind, enricher) {
        invariant(
          isElementRef(kind),
          'You must provide a valid element reference to register'
        )
        invariant(
          enricher != null && typeof enricher === 'function',
          'You must provide an enricher function'
        )

        registry.register(kind, enricher)
      },

      reset() {
        registry.reset()
      },
    },
  }
})

export default SubSystem.create(system => ({
  name: 'enrich',

  buildEnricher() {
    const combinedRegistry = getCombinedRegistry(system.subsystemSequence)

    if (combinedRegistry == null) {
      return x => Promise.resolve(x)
    }
    return impl.enricher(combinedRegistry)
  },
}))

const getRegistry = R.path(['enrich', registryAttribute])

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainMultivalueRegistries
)
