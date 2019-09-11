'use strict'

import invariant from './invariant'

import * as E from './extensions'
import * as U from './util'
import Unit, * as unt from './unit'

const P = {
  exts: Symbol('sys/exts'),
  indices: Symbol('sys/indices'),
  insts: Symbol('sys/insts'),
  extId: Symbol('sys/extId'),
}

/**
 * @typedef System
 */

/**
 * Creates a new System out of the provided extension definitions (exts).
 *
 * @param {string} [ShortDesc] - optional description of the unit.
 * @param {...unt.ExtOrExts} - the extension definitions
 * @returns {System} - a newly constructed system
 *
 * @see Unit
 */
export default function System(...args) {
  return {
    [P.exts]: withIds(Unit(...args)),
    [P.insts]: {},
    [P.indices]: {},
  }
}

/**
 * Queries the system for the extensions satisyfing q.
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
  const specs = queryExts(q, sys)

  return E.isOne(q) ? instance(specs, sys) : Array.from(instances(specs, sys))
}

/**
 * Queries the system for the the extension definitions. This method will not
 *  instantate any extensions.
 *
 *
 * @param {E.Query} q the query.
 * @param {System} sys a system
 * @return {E.Ext|E.Ext[]} the extension definitions (exts) in the system
 * satisfying the query. A query looking for many extensions ([slot], [slot,
 * pred]) will return an empty array in there are no matching extensions. A
 * query looking for a single extension (slot) will return undefined in such a caee.
 */
export const queryExts = (q, sys) => {
  invariant(() => isSystem(sys), 'You must provide a valid system')

  q = E.parseQuery(q)
  return queryIndex(q, index(E.qOrder(q), sys))
}

const describe = ext => {
  const uDesr = unt.unitDesc(ext)
  const slots = E.extSlots(ext)

  return `Ext(of ${slots.map(s => s.toString())}, at ${uDesr})`
}

const withIds = unit => ({
  [Symbol.iterator]: function() {
    return iterateExts(unit)
  },
})

function* iterateExts(unit) {
  let cid = 0
  for (const ext of unt.iterate(unit)) {
    yield {
      ...ext,
      [P.extId]: cid,
    }
    cid += 1
  }
}

const queryIndex = (q, idx) => {
  const exts = U.select(E.qFilter(q), idx[E.extOf(q)])

  return E.isOne(q) ? U.last(exts) : exts
}

const index = (order, sys) => {
  if (sys[P.indices][order] == null) {
    invariant(
      () => buildIndex[order] != null,
      'There must be an index builder for the order %s',
      order
    )

    sys[P.indices][order] = buildIndex[order](sys)
  }

  return sys[P.indices][order]
}

const buildSimpleIndex = exts => {
  let result = {}

  const push = (x, slot) => {
    if (result[slot] == null) {
      result[slot] = []
    }
    result[slot].push(x)
  }

  for (let spec of exts) {
    for (const slot of E.extSlots(spec)) {
      push(spec, slot)
    }
  }

  return result
}

const buildTopologicalIndex = sys => {
  const defIndex = index(E.order.definition, sys)
  return buildSimpleIndex(toposort(defIndex, sys[P.exts]))
}

const buildIndex = {
  [E.order.definition]: sys => buildSimpleIndex(sys[P.exts]),
  [E.order.topological]: buildTopologicalIndex,
}

const instances = function*(specs, sys) {
  for (const ext of specs) {
    yield instance(ext, sys)
  }
}

const instance = (ext, sys, path = []) => {
  if (ext == null) return undefined

  const id = extId(ext)

  if (U.find(e => extId(e) === id, path) != null) {
    throw new Error(
      `Circular dependency (->: depends on): ${[...path, ext]
        .map(describe)
        .join(' -> ')}`
    )
  }

  if (sys[P.insts][id] == null) {
    // check cycle
    const deps = buildDeps(ext, sys, [...path, ext])

    try {
      sys[P.insts][id] = E.extFactory(ext)(deps)
    } catch (e) {
      throw new Error(`Could not instantiate ext: ${ext}, reason ${e}`)
    }
  }

  return sys[P.insts][id]
}

const buildDeps = (ext, sys, path) => {
  let deps = {}
  let depSpecs = E.deps(ext)

  if (depSpecs == null) return deps

  let responses = {}
  for (const dep in depSpecs) {
    const depQuery = depSpecs[dep]

    Object.defineProperty(deps, dep, {
      enumerable: true,

      get: () => {
        const resp = responses[dep]
        if (resp === null) {
          return null
        } else if (typeof resp === 'undefined') {
          const exts = queryExts(depQuery, sys)

          if (Array.isArray(exts)) {
            responses[dep] = U.map(e => instance(e, sys, path), exts)
          } else if (ext != null) {
            responses[dep] = instance(exts, sys, path)
          } else {
            respones[dep] = null
          }
        }
        return responses[dep]
      },
    })
  }

  return deps
}

const extId = ext => ext[P.extId]

export const isSystem = sys =>
  sys != null && sys[P.exts] != null && sys[P.insts] != null

const toposort = (index, exts) => {
  let sorted = []
  let visited = new Set()

  function* iterateDeps(ext) {
    const deps = U.flow(
      ext,

      E.deps,
      U.mapObjVals(dq => queryIndex(E.parseQuery(dq), index))
    )

    for (const k in deps) {
      let v = deps[k]

      if (Array.isArray(v)) {
        yield* v
      } else {
        yield v
      }
    }
  }

  const visit = (ext, path) => {
    const eid = extId(ext)

    if (U.find(e => extId(e) === eid, path) != null) {
      throw new Error(
        `Circular dependency (->: depends on): ${[...path, ext]
          .map(describe)
          .join(' -> ')}`
      )
    }

    if (U.has(eid, visited)) return
    visited = U.add(eid, visited)

    for (const dep of iterateDeps(ext)) {
      visit(dep, [...path, ext])
    }

    sorted.push(ext)
  }

  for (const ext of exts) {
    visit(ext, [])
  }
  return sorted
}
