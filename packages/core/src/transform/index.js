'use strict'

import R from 'ramda'
import invariant from 'invariant'

import { isElementRef } from '../data'

import * as SubSystem from '../subsystem'
import { MultivalueRegistry, MultivalueRegistryChain } from '../registry'

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
    },
  }
})

export default SubSystem.create(system => ({
  /**
   * Creates the read transformer
   */
  buildTransformer() {
    return impl.transformer(
      getCombinedRegistry(system.subsystemSequence),
      system.config.transform.childPositions ||
        system.config.transform.childrenElements
    )
  },
}))

const getRegistry = R.prop(registryAttribute)

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  R.cond(
    [a => a.length === 0, new MultivalueRegistry()],
    [a => a.length === 1, a[0]],
    [
      R.T,
      R.reduce(
        (a, b) => new MultivalueRegistryChain(a, b),
        new MultivalueRegistry()
      ),
    ]
  )
)

// export default {
//   register,
//   apply,
//   get,
//   reset,
// }
