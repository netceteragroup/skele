'use strict'

import R from 'ramda'
import invariant from 'invariant'

import { isElementRef } from '../data'

import * as SubSystem from '../subsystem'
import { MultivalueRegistry, chainMultivalueRegistries } from '../registry'

import * as impl from './impl'

const registryAttribute = '@@girders-elements/_enhanceRegistry'

SubSystem.extend(() => {
  const registry = new MultivalueRegistry()

  return {
    enhance: {
      [registryAttribute]: registry,

      /**
       * Registers an enhancer for the specific kind
       */
      register(kind, enhancer) {
        invariant(
          isElementRef(kind),
          'You must provide a valid element reference to register'
        )
        invariant(
          enhancer != null && typeof enhancer === 'function',
          'You must provide an enhancer function'
        )

        registry.register(kind, enhancer)
      },

      reset() {
        registry.reset()
      },
    },
  }
})

export default SubSystem.create(system => ({
  name: 'enhance',

  buildEnhancer() {
    const combinedRegistry = getCombinedRegistry(system.subsystemSequence)

    if (combinedRegistry == null) {
      return x => Promise.resolve(x)
    }
    return {
      enhancer: impl.enhancer({
        registry: combinedRegistry,
        elementZipper: system.elementZipper,
      }),
      extractUpdates: impl.extractUpdates({
        registry: combinedRegistry,
        elementZipper: system.elementZipper,
      }),
      executeUpdates: impl.executeUpdates({
        elementZipper: system.elementZipper,
      }),
    }
  },
}))

const getRegistry = R.path(['enhance', registryAttribute])

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainMultivalueRegistries
)
