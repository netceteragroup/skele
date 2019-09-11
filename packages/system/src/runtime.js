'use strict'

import invariant from 'invariant'
import * as U from './util'
import * as E from './extensions'
import * as S from './system'

/**
 * Slots defined in this module
 * @namespace
 */
export const slots = {
  /** The unit extension slot */
  runtime: Symbol('runtime'),
}

/**
 * Creates a runtime extension. Runtimes are objects, usually keeping some kind
 * of state within.
 *
 * The runtime can have optional start and stop methods which are invoked on
 * system startup and shutdown.
 *
 * Runtime must be additionally named so that they can be accessed individually.
 *
 * @param {symbol} name -  name for the runtime
 * @param {E.Deps} [deps] - the dependencies of this runtime
 * @param {RuntimeFactory} def - the definition of the Unit
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
    E.named(name),
    U.when(() => deps != null, E.using(deps))
  )
}

/**
 * Starts all the runtimes in the provided system.
 *
 * The method makes sure that if runtimes A is somethow a dependency of
 * runtime B, A is started earlier than B.
 *
 * @param {S.System} sys - the system
 * @returns {S.System} - the sysetem
 */
export const start = sys => {
  invariant(() => S.isSystem(sys), 'You must provide a system')

  const runtimes = S.query([slots.runtime, E.all, E.order.topological], sys)
  for (const r of runtimes) {
    if (U.isFunction(r.start)) r.start()
  }

  return sys
}

/**
 * Stops all runtimes in the provided system.
 *
 * The method makes sure that if runtimes A is somethow a dependency of
 * runtime B, B is stopped before A.
 *
 * @param {S.System} sys - the system
 * @returns {S.System} - the sysetem
 */
export const stop = sys => {
  invariant(() => S.isSystem(sys), 'You must provide a system')

  const runtimes = U.reverse(
    S.query([slots.runtime, E.all, E.order.topological], sys)
  )
  for (const r of runtimes) {
    if (U.isFunction(r.stop)) r.stop()
  }

  return sys
}
