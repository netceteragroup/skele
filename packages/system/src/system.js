'use strict'

import invariant from './invariant'

import * as E from './extensions'
import * as U from './util'
import Unit, * as unt from './unit'

const specs = Symbol('specs')
const index = Symbol('index')
const insts = Symbol('insts')
const extIdentifier = Symbol('extId')

/**
 * @typedef System
 */

/**
 * Creates a new System out of the provided extensions.
 *
 * @param {string} [ShortDesc] - optional description of the unit.
 * @param {...unt.ExtOrExts} - extensions
 * @returns {System} - a newly constructed system
 *
 * @see Unit
 */
export default function System(...args) {
  return {
    [specs]: Unit(...args),
    [insts]: {},
  }
}

/**
 * Queries the system for the extensions satisyfing the provided query.
 *
 * @param {E.Query} q the query.
 * @param {System} sys a system
 * @return {*} the extension instances in the system satisfying the query. A
 * query looking for many extensions ([slot], [slot, pred]) will return an empty
 * array in there are no matching extensions. A query looking for a single
 * extension (slot) will return undefined in such a caee.
 */
export const query = (q, sys) => {
  invariant(() => isSystem(sys), 'You must provide a valid system')

  q = E.parseQuery(q)
  const specs = querySpecs(q, sys)

  return E.isOne(q) ? instance(specs, sys) : Array.from(instances(specs, sys))
}

/**
 * Queries the system for the the extension specifications satisfying the
 * query. This method will not instantate any extensions.
 *
 *
 * @param {E.Query} q the query.
 * @param {System} sys a system
 * @return {E.Extension|E.Extension[]} the extension instances in the system
 * satisfying the query. A query looking for many extensions ([slot], [slot,
 * pred]) will return an empty array in there are no matching extensions. A
 * query looking for a single extension (slot) will return undefined in such a caee.
 */
export const querySpecs = (q, sys) => {
  invariant(() => isSystem(sys), 'You must provide a valid system')

  q = E.parseQuery(q)

  if (sys[index] == null) {
    buildIndex(sys)
  }

  const specs = U.select(E.qFilter(q), sys[index][E.extOf(q)])

  return E.isOne(q) ? U.last(specs) : specs
}

const buildIndex = sys => {
  sys[index] = {}

  const push = (x, slot) => {
    if (sys[index][slot] == null) {
      sys[index][slot] = []
    }
    sys[index][slot].push(x)
  }

  let cid = 0
  for (let spec of unt.iterate(sys[specs])) {
    spec = {
      ...spec,
      [extIdentifier]: cid,
    }
    cid += 1

    for (const slot of E.extSlots(spec)) {
      push(spec, slot)
    }
  }
}
const instances = function*(specs, sys) {
  for (const ext of specs) {
    yield instance(ext, sys)
  }
}

const instance = (ext, sys, path = []) => {
  if (ext == null) return undefined

  const id = extId(ext)

  if (sys[insts][id] == null) {
    // check cycle
    if (U.find(e => extId(e) === id, path) != null) {
      throw new Error(
        `Circular dependency detected in this extension chain ${[...path, ext]}`
      )
    }
    const deps = buildDeps(ext, sys, [...path, ext])

    try {
      sys[insts][id] = E.extFactory(ext)(deps)
    } catch (e) {
      throw new Error(`Could not instantiate ext: ${ext}, reason ${e}`)
    }
  }

  return sys[insts][id]
}

const buildDeps = (ext, sys, path) => {
  let deps = {}
  let depSpecs = E.deps(ext)

  if (depSpecs == null) return deps

  let responses = {}
  for (const dep of depSpecs) {
    const depQuery = depSpecs[dep]

    Object.defineProperty(deps, dep, {
      enumerable: true,
      writable: false,

      get: () => {
        const resp = responses[dep]
        if (resp === null) {
          return null
        } else if (typeof resp === 'undefined') {
          const exts = query(depQuery, sys)

          if (Array.isArray(exts)) {
            responses[dep] = U.map(e => instance(e, sys, path))
          } else if (ext != null) {
            responses[dep] = instance(e, sys, path)
          } else {
            respones[dep] = null
          }
        }
        return responses[dep]
      },
    })
  }
}

const extId = ext => ext[extIdentifier]

const isSystem = sys => sys != null && sys[specs] != null && sys[insts] != null
