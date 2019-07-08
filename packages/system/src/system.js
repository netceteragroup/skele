'use strict'

import invariant from 'invariant'

import * as E from './extensions'
import * as U from './util'
import * as runitme from './runtime'
import Unit from './unit'

const specs = Symbol('specs')
const index = Symbol('index')
const insts = Symbol('insts')
const extIdentifier = Symbol('extId')

export default function System(...args) {
  return {
    [specs]: Unit(...args),
    [insts]: {},
  }
}

export const lazyQuery = function*(inQ, sys) {
  const q = E.parseQuery(inQ)

  if (sys[index] == null) {
    buildIndex(sys)
  }

  for (const ext of queryIndex(q, sys[index])) {
    yield instance(ext, sys)
  }
}

export const query = (q, sys) => Array.from(lazyQuery(q, sys))

// TODO buildIndex and queryIndex

const instance = (ext, sys, path = []) => {
  const id = extId(ext)

  if (sys[insts][id] == null) {
    // check cycle
    if (path.find(e => extId(e) === extId(ext)) != null) {
      throw new Error(
        `Circular dependency detected in this extension chain ${[...path, ext]}`
      )
    }
    const deps = buildDeps(ext, sys, [...path, ext])

    try {
      sys[insts][extId(ext)] = E.extFactory(ext)(deps)
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
// OLD CODE
