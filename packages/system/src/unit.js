'use strict'

import invariant from 'invariant'

const metaProp = '@@skele/system.internal.unitMeta'

export default function Unit(definition) {
  invariant(
    typeof definition === 'object' || typeof definition === 'function',
    'You must provide an object or a function as the unit definition'
  )

  const unit = function(deps = {}) {
    let instance
    if (typeof definition === 'object') {
      instance = {
        ...definition,
        [metaProp]: { instance: true },
      }
    } else {
      instance = {
        ...definition(deps),
        [metaProp]: { ...unitMeta(definition), instance: true },
      }
    }

    return instance
  }

  unit[metaProp] = {}

  return unit
}

export const unitMeta = unit => (unit != null && unit[metaProp]) || {}

export const isInstance = unit => unitMeta(unit).instance

export const updateUnitMeta = (update, unit) => {
  unit[metaProp] = update(unitMeta(unit))
  return unit
}

const callIfExists = method => unitInstance => {
  invariant(isInstance(unitInstance), 'You must provide an instantiated unit')

  invariant(
    unitInstance[method] == null || typeof unitInstance[method] === 'function',
    `The unit instance ${method} property must be a function`
  )

  if (typeof unitInstance.start === 'function') {
    unitInstance[method]()
  }

  return unitInstance
}

export const start = callIfExists('start')

export const stop = callIfExists('stop')
