'use strict'

import R from 'ramda'
import invariant from 'invariant'

import { isElementRef } from '../data'

import * as SubSystem from '../subsystem'
import { MultivalueRegistry, chainMultivalueRegistries } from '../registry'

import * as impl from './impl'

const registryAttribute = '@@girders-elements/_transformRegistry'

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
        this[registryAttribute].reset()
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
    return impl.transformer(
      combinedRegistry,
      getChildPostions(system.config) || getChildElements(system.config)
    )
  },
}))

const getRegistry = R.pipe(R.prop('transform'), R.prop(registryAttribute))

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainMultivalueRegistries
)

const getChildPostions = R.path(['transform', 'childPositions'])
const getChildElements = R.path(['transform', 'childrenElements'])
