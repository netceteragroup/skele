'use strict'

import invariant from 'invariant'
import * as R from 'ramda'
import uuid from 'uuid'

// what is a subsystem

// required

// -- name: the name of the subsystem
export const name = R.prop('name')

// -- middleware (optional)
export const middleware = R.prop('middleware')

// -- reducer (optional)
export const reducer = R.prop('reducer')

// -- start (optional)

// -- element mixins (optional, not implemented currently)
export const elementMixins = R.pipe(R.prop('elementMixins'), R.defaultTo([]))

// -- engine mixins (optional)
export const engineMixins = R.pipe(R.prop('engineMixins'), R.defaultTo([]))

// default extension points

// -- updates
// -- effects
// -- ui
// -- custom methods

export const subsystemFnAttribute = '@@girders-elements/subsystemFn'
let extensions = []

/*
  Allows adding extension points for subsystems:

  Subsystem.extend(sub)

  This will add a property read  all follwoing subsystems with the methods
  defined here.
*/
export function extend(extension) {
  invariant(
    typeof extension === 'function',
    'You must provide a function subsystem => extension'
  )
  extensions.push(extension)
}

export function resetExtensions() {
  extensions = []
}

/*
  subsystemFnAttribute: kernel => subsystemDef
  allows subsystems to export an object
  where calls to customized registreations can be made

  e.g. file defaultSubsystem.s:

  import Subsystem from 'subsystem'

  export default Subsystem.create(kernel => {
    name: 'default',
    reducer: ...
    middleware: ...
  })

  this object then exposes standard entrypoints for registreations:

  import { ui, update } from 'defaultSubsystem'

  ui.register(...)

  update.register(...)

  But also, if a subsystem adds an extension, other subsystems may contribute to
  (see extend())

*/
export function create(subsystemFn) {
  invariant(
    typeof subsystemFn === 'function',
    'You must provide a creator function'
  )

  return R.reduce(
    (subsystem, ext) => ({ ...subsystem, ...ext(subsystem) }),
    {
      [subsystemFnAttribute]: subsystemFn,
    },
    extensions
  )
}

export function fromMiddleware(middleware, name = undefined) {
  if (name == null) name = uuid()

  return create(() => ({
    name,
    middleware,
  }))
}

export const instantiate = R.curry((kernel, instantiated, subsystem) => {
  let instance = subsystem[subsystemFnAttribute](kernel, instantiated)
  invariant(instance.name, 'The subsystem must have a name property')

  Object.setPrototypeOf(instance, subsystem)

  return instance
})
