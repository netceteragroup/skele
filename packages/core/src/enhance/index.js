'use strict'

import R from 'ramda'
import { List } from 'immutable'
import invariant from 'invariant'

import { isElementRef } from '../data'

import * as SubSystem from '../subsystem'
import { MultivalueRegistry, chainMultivalueRegistries } from '../registry'

import * as impl from './impl'

const readDependentRegistryAttribute =
  '@@girders-elements/_readDependentEnhanceRegistry'
const readIndependentListAttribute =
  '@@girders-elements/_readIndependentEnhanceList'

SubSystem.extend(() => {
  const readDependentRegistry = new MultivalueRegistry()
  const readIndependentList = List().asMutable()

  return {
    enhance: {
      [readDependentRegistryAttribute]: readDependentRegistry,
      [readIndependentListAttribute]: readIndependentList,

      /**
       * Registers an enhancer for the specific kind
       */
      register(kind, enhancer) {
        if (enhancer == null) {
          enhancer = kind
          kind = null
        }
        invariant(
          isElementRef(kind) || kind == null,
          'You must provide a valid element reference to register'
        )
        invariant(
          enhancer != null && typeof enhancer === 'function',
          'You must provide an enhancer function'
        )

        kind != null
          ? readDependentRegistry.register(kind, enhancer)
          : readIndependentList.push(enhancer)
      },

      reset() {
        readDependentRegistry.reset()
        readIndependentList.clear()
      },
    },
  }
})

export default SubSystem.create(system => ({
  name: 'enhance',

  buildEnhanceHelper() {
    const combinedReadDependentRegistry = getCombinedRegistry(
      system.subsystemSequence
    )
    const combinedReadIndependentList = getCombinedList(
      system.subsystemSequence
    )

    if (
      combinedReadDependentRegistry.isEmpty() &&
      combinedReadIndependentList.isEmpty()
    ) {
      return {
        readDependentEnhancers: R.always(List()),
        readIndependentEnhancers: R.always(List()),
        runEnhancers: x => Promise.all([Promise.resolve(x)]),
        // runEnhancers: x => Promise.resolve(x),
        applyEnhancements: R.identity,
      }
    }

    return {
      readDependentEnhancers: kind => combinedReadDependentRegistry.get(kind),
      readIndependentEnhancers: () => combinedReadIndependentList,

      runEnhancers: impl.runEnhancers,
      applyEnhancements: impl.applyEnhancements,
    }
  },
}))

const getRegistry = R.path(['enhance', readDependentRegistryAttribute])

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainMultivalueRegistries
)

const getList = R.path(['enhance', readIndependentListAttribute])
const iconcat = (a, b) => a.concat(b)

const getCombinedList = R.pipe(
  R.map(getList),
  R.reject(R.isNil),
  R.map(l => l.asImmutable()),
  R.reduce(iconcat, List())
)
