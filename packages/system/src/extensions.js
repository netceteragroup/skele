'use strict'

import invariant from 'invariant'
import { subsystemMeta, updateSubsystemMeta } from './subsystem'
import uuid from 'uuid'
import * as u from './util'

const idProp = '@@skele/system.internal.extensionId'

export default function ExtensionSlot(def) {
  invariant(
    typeof def === 'function',
    'You must provide a function that defines the extension slot'
  )

  const id = uuid()

  const slot = function extensionSlot(subsystem) {
    invariant(subsystem != null, 'You must provide a subsystem')

    let ext = extensionOf(slot, subsystem)

    if (ext == null) {
      ext = def()

      invariant(
        typeof ext === 'object' && !Array.isArray(ext),
        'ExtensionSlot fn must return an object'
      )

      invariant(
        typeof ext.collect === 'function',
        'the ExtensionSlot fn return value must have a `collect()` method'
      )

      setExtension(slot, ext, subsystem)
    }

    return ext
  }

  slot[idProp] = id

  return slot
}

export const extensionOf = (slot, subsystem) => {
  invariant(slot[idProp] != null, 'You must provide an extension slot')

  return extensionsOf(subsystem)[slot[idProp]]
}

export const idOf = ext => ext[idProp]

export const collect = (slot, subsystem) => {
  const ext = extensionOf(slot, subsystem)
  return ext != null ? { ...ext.collect(), [idProp]: slot[idProp] } : undefined
}

const extensionsOf = subsystem => subsystemMeta(subsystem).extensions || {}

const updateExtensions = (update, ss) =>
  updateSubsystemMeta(
    u.partial(u.update, 'extensions', exts => update(exts || {})),
    ss
  )

const setExtension = (slot, ext, subsystem) =>
  updateExtensions(u.partial(u.assoc, slot[idProp], ext), subsystem)
