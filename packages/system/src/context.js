'use strict'

import invariant from 'invariant'

import Unit from './unit'
import ExtensionSlot, { idOf } from './extensions'

const context = Unit(({ contextDefs = [], unitFor }) => ({
  /**
   * Builds a context object for the
   */
  contextFor: (context, extension, opts) => {
    if (opts == null) {
      ;[context, extension, opts] = ['global', context, extension]
    }

    if (opts == null) opts = {}

    invariant(
      idOf(extension) != null,
      'You must provide an extension for which you want the context for'
    )

    const unit = unitFor(extension)
    const ctx = buildContext(context, unitFor, contextDefs)

    return {
      ...ctx,
      unit,
    }
  },
}))

const contextDefs = ExtensionSlot(() => {
  let defs = {}

  const def = (context, name, provider) => {
    if (provider == null) {
      provider = name
      name = context
      context = 'global'
    }

    invariant(
      typeof name === 'string',
      'You must provide a name for the context object you are providing'
    )

    invariant(
      typeof provider === 'function',
      'You must provide a context object provider fn'
    )

    let ctx = defs[context]
    if (ctx == null) {
      ctx = {}
      defs[context] = ctx
    }

    ctx[name] = fn

    return fn
  }

  return {
    def,
    register: def,

    collect() {
      return { defs }
    },
  }
})

const buildContext = (context, unitFor, contextDefs) => {
  let result = {}

  const fill = context => {
    for (const def of contextDefs) {
      const unit = unitFor(def)
      const named = def.defs[context]

      if (named != null) {
        for (const key in named) {
          result[key] = named[key]({ unit })
        }
      }
    }
  }

  if (context != null) fill(global)
  fill(context)

  return result
}

export default context
export { contextDefs }
