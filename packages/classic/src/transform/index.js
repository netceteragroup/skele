'use strict'

import * as R from 'ramda'
import invariant from 'invariant'

import { isElementRef } from '../data'

import * as SubSystem from '../subsystem'
import { MultivalueRegistry, chainMultivalueRegistries } from '../registry'

import * as impl from './impl'

const registryAttribute = '@@skele/_transformRegistry'

SubSystem.extend(() => {
  const registry = new MultivalueRegistry()

  return {
    transform: {
      [registryAttribute]: registry,

      /**
       * Registers a transformer for the specific kind
       */
      register(kind, transformer) {
        invariant(
          isElementRef(kind),
          'You must provide a valid element reference to register'
        )
        invariant(
          transformer != null && typeof transformer === 'function',
          'You must provide a transformer function'
        )

        registry.register(kind, transformer)
      },

      reset() {
        registry.reset()
      },
    },
  }
})

export default SubSystem.create(system => ({
  name: 'transform',
  /**
   * Creates the read transformer
   */
  buildTransformer() {
    const combinedRegistry = getCombinedRegistry(system.subsystemSequence)

    if (combinedRegistry == null) {
      return R.identity
    }
    return impl.transformer(combinedRegistry, system.elementZipper)
  },
}))

const getRegistry = R.path(['transform', registryAttribute])

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainMultivalueRegistries
)
