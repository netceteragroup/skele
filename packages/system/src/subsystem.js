'use strict'

import invariant from 'invariant'

const subsystemMeta = '@@skele/system.internal.subsystemMeta'
const instanceMeta = '@@skele/system.internal.subsystemInstanceMeta'

export default function Subsystem(definition) {
  invariant(
    typeof definition === 'object' || typeof definition === 'function',
    'You must provide an object or a function as the subsystem definition'
  )

  const subsystem = function(deps = {}) {
    let instance
    if (typeof definition === 'object') {
      instance = {
        ...definition,
        [instanceMeta]: {},
      }
    } else {
      instance = {
        ...definition(deps),
        [instanceMeta]: {},
      }
    }

    return instance
  }

  subsystem[subsystemMeta] = {}

  return subsystem
}

const callIfExists = method => subsystemInstance => {
  invariant(
    subsystemInstance != null && subsystemInstance[instanceMeta] != null,
    'You must provide an instantiated subsystem'
  )

  invariant(
    subsystemInstance[method] == null ||
      typeof subsystemInstance[method] === 'function',
    `The subsystem instance ${method} property must be a function`
  )

  if (typeof subsystemInstance.start === 'function') {
    subsystemInstance[method]()
  }

  return subsystemInstance
}

export const start = callIfExists('start')

export const stop = callIfExists('stop')
