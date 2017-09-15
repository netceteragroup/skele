'use strict'

import R from 'ramda'

import * as actions from '../action'
import * as data from '../data'
import { ActionRegistry } from '../registry'

import { findParentEntry } from '../impl/cursor'

const updateStateAction = '@@girders-elements/_effects.updateState'

export const middleware = R.curry((config, store, next, action) => {
  const { kernel, effectsRegistry } = config
  const actionMeta = actions.actionMeta(action)

  if (actionMeta == null) return next(action)

  const key = ActionRegistry.keyFromAction(action)
  let effect = effectsRegistry.get(key)
  let context = kernel.focusOn(actionMeta.keyPath)

  if (effect == null && action.type.startsWith('.')) {
    // global action
    const keyFn = el => ActionRegistry.keyFor(data.kindOf(el), action.type)
    const entry = findParentEntry(effectsRegistry, keyFn, context.query())

    if (entry != null) {
      const { element, entry: eff } = entry
      effect = eff
      context = kernel.focusOn(element._keyPath)
    }
  }

  if (effect != null) {
    const result = effect(context, action)

    if (result && typeof result.then === 'function') {
      result.then(updateFn => {
        if (typeof updateFn === 'function') {
          context.dispatch({ type: updateStateAction, updateFn })
        }
      })
    }
  } else {
    // the effect consumes the action
    return next(action)
  }
})

export const reducer = R.curry((config, state, action) => {
  if (action.type === updateStateAction) {
    const { keyPath } = actions.actionMeta(action)
    return state.updateIn(keyPath, action.updateFn)
  }
  return state
})
