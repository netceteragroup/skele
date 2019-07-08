'use strict'

import invariant from 'invariant'
import * as U from './util'
import * as E from './extensions'

/**
 * Slots defined in this module
 * @namespace
 */
export const slots = {
  /** The unit extension slot */
  runtime: Symbol('runtime'),
}

/**
 * Creates a runtime extension.
 *
 * @param {symbol} name - optional name for the runtime
 * @param {E.Deps} [deps] - the dependencies of this runtime
 * @param {UnitFactory} def - the definition of the Unit
 */
export const runtime = (name, deps, def) => {
  if (def == null) {
    def = deps
    deps = undefined
  }

  invariant(U.isSymbol(name), 'Name must be a symbol')
  invariant(
    typeof def === 'function',
    'An extension factory fn must be provided'
  )

  return U.flow(
    def,
    E.ext(slots.runtime),
    U.when(() => name != null, E.named(name)),
    U.when(() => deps != null, E.using(deps))
  )
}
