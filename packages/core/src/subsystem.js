'use strict'

import invariant from 'invariant'
import R from 'ramda'

// what is a subsystem

// required

// -- name: the name of the subsystem
export const name = R.prop('name')

// -- middleware (optional)
export const middleware = R.prop('middleware')

// -- reducer (optional)
export const reducer = R.pipe(R.prop('middleware'), R.defaultTo(R.identity))

// -- element mixins (optional)
export const elementMixins = R.pipe(R.prop('elementMixins'), R.defaultTo([]))

// -- engine mixins
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

export const instantiate = R.curryN(2, (kernel, subsystem) => {
  let instance = subsystem[subsystemFnAttribute](kernel)

  invariant(instance.name, 'The subsystem must have a name property')

  Object.setPrototypeOf(instance, subsystem)

  return instance
})

export default {
  extend,
  resetExtensions,
  create,
  name,
  middleware,
  reducer,
  elementMixins,
  engineMixins,
}
