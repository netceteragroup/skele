'use strict'

import invariant from 'invariant'

const metaProp = '@@skele/system.internal.subsystemMeta'

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
        [metaProp]: { instance: true },
      }
    } else {
      instance = {
        ...definition(deps),
        [metaProp]: { ...subsystemMeta(definition), instance: true },
      }
    }

    return instance
  }

  subsystem[metaProp] = {}

  return subsystem
}

export const subsystemMeta = subsystem =>
  (subsystem != null && subsystem[metaProp]) || {}

export const isInstance = subsystem => subsystemMeta(subsystem).instance

export const updateSubsystemMeta = (update, subsystem) => {
  subsystem[metaProp] = update(subsystemMeta(subsystem))
  return subsystem
}

const callIfExists = method => subsystemInstance => {
  invariant(
    isInstance(subsystemInstance),
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
