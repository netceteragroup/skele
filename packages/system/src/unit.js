'use strict'

import invariant from 'invariant'
import * as u from './util'

const metaProp = '@@skele/system.internal.unitMeta'

export default function Unit(definition) {
  u.conformUnitDef(definition)

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

  if (typeof unitInstance[method] === 'function') {
    unitInstance[method]()
  }

  return unitInstance
}

export const start = callIfExists('start')

export const stop = callIfExists('stop')
