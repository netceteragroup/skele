'use strict'

import { List } from 'immutable'

import { data, registry } from '@skele/core'
import * as actions from '../action'

const { Registry, MultivalueRegistry } = registry

export const keyFor = (kind, action) => List.of(data.canonical(kind), action)

export const keyFromAction = ({
  [actions.actionMetaProperty]: { kind },
  type,
}) => keyFor(kind, type)

const RegistryForActions = Superclass => {
  const NewClass = class extends Superclass {
    _lessSpecificKey(key) {
      if (key != null) {
        const kind = key.get(0)
        const lessSpecific = super._lessSpecificKey(kind)

        if (lessSpecific != null) {
          return keyFor(lessSpecific, key.get(1))
        }
      }

      return undefined
    }
  }
  NewClass.keyFor = keyFor
  NewClass.keyFromAction = keyFromAction

  return NewClass
}

export const ActionRegistry = RegistryForActions(Registry)
export const ActionMultivalueRegistry = RegistryForActions(MultivalueRegistry)
