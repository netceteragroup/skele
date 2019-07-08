'use strict'

import * as U from './util'
import * as E from './extensions'
import invariant from './invariant'

export const unitDescriptor = Symbol('unitDesc')

/**
 * @typedef {E.Extension|E.Extension[]} ExtOrExts
 *
 * A single extension or an array of extensions. Units are
 * arrays
 */

/**
 * @typedef {(E.Extension|Unit)[]} Unit
 * A unit is simply an array of extensions or other units.
 */

/**
 * Creates a new Unit. a unit is simply a collection of extensions. You can
 * insert other units in place of an extension. All these will get flattened
 * into a single list during the creation of the system.
 *
 * @param {string} [ShortDesc] - optional description of the unit.
 * @param {...ExtOrExts} - extensions
 */
export default function Unit(...args) {
  let desc
  if (typeof args[0] === 'string') {
    desc = args.shift()
  } else {
    desc = null
  }

  let ret = args

  ret[unitDescriptor] = desc

  return ret
}

const compoundDesc = (unit, descStack = []) => {
  const desc = unitDesc(unit)

  return desc != null ? [...descStack, desc] : descStack
}
/**
 * Description of a unit.
 * @function
 * @param {ExtOrExts[]} unit - the unit
 * @returns {string[]} the description of the unit
 */
export const unitDesc = U.prop(unitDescriptor)

/**
 * A generator that will iterate through a unit's ext definitions in a 'flat
 * manner.
 * @param {Unit} unit - the unit to be iterated
 */
export function* iterate(unit, descStack = []) {
  const desc = compoundDesc(unit, descStack)
  for (const u of unit) {
    if (Array.isArray(u)) {
      yield* iterate(u, desc)
    } else {
      validateExt(desc, u)
      yield {
        ...u,
        [unitDescriptor]: desc,
      }
    }
  }
}

const validateExt = (desc, ext) => {
  invariant(
    () => E.extSlots(ext) != null,
    'The extension must have a slot (at %s)',
    desc
  )

  invariant(
    () => {
      const slots = E.extSlots(ext)

      return (
        U.isSymbol(slots) ||
        (Array.isArray(slots) && U.every(U.isSymbol, slots))
      )
    },
    'The slot must be a single symbol or an array of symbols (at %s)',
    desc
  )

  invariant(
    () => typeof E.extFactory(ext) === 'function',
    'The extension must have a factory function (at %s)',
    desc
  )

  invariant(
    () => {
      const deps = E.deps(ext)

      return deps == null || (Array.isArray(deps) && U.every(isDep, deps))
    },
    'Invalid dependency specification: %s (at %s)',
    E.deps(ext),
    desc
  )
}
