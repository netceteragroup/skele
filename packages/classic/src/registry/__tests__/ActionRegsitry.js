'use strict'

import { ActionRegistry, keyFor, keyFromAction } from '../ActionRegistry'

import * as actions from '../../action'
import { List } from 'immutable'
import * as R from 'ramda'

describe('ActionRegistry', () => {
  let registry
  beforeEach(() => (registry = new ActionRegistry()))

  test('works like a registry in terms of the kind, but keeps unique named actions for each kind', () => {
    registry.register(keyFor([], 'update'), 1)
    registry.register(keyFor('foo', 'update'), 2)
    registry.register(keyFor(['foo', 'bar'], 'update'), 4)

    expect(registry.get(keyFromAction(makeAction([], 'update')))).toEqual(1)
    expect(
      registry.get(keyFromAction(makeAction([], 'update-x')))
    ).toBeUndefined()

    expect(registry.get(makeKeyFromAction('foo', 'update'))).toEqual(2)
    expect(registry.get(makeKeyFromAction(['foo'], 'update'))).toEqual(2)
    expect(registry.get(makeKeyFromAction(List.of('foo'), 'update'))).toEqual(2)

    expect(registry.get(makeKeyFromAction(['foo', 'bar'], 'update'))).toEqual(4)
    expect(
      registry.get(makeKeyFromAction(['foo', 'bar', 'baz'], 'update'))
    ).toEqual(4)
    expect(registry.get(makeKeyFromAction(['foo', 'X'], 'update'))).toEqual(2)
    expect(
      registry.get(makeKeyFromAction(['foo', 'X'], 'update-x'))
    ).toBeUndefined()
    expect(registry.get(makeKeyFromAction(['bla'], 'update'))).toEqual(1)
    expect(registry.get(makeKeyFromAction(['bla'], 'update-x'))).toBeUndefined()
  })
})

function makeAction(kind, type) {
  return {
    [actions.actionMetaProperty]: {
      kind,
    },
    type,
  }
}

const makeKeyFromAction = R.compose(
  keyFromAction,
  makeAction
)
