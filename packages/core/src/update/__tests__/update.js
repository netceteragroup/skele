'use strict'

import { fromJS } from 'immutable'
import Cursor from 'immutable/contrib/cursor'

import * as actions from '../../action'
import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import { ActionRegistry } from '../../registry'

import { flow } from '../../data'
import updateSubS from '..'

const registryAttribute = '@@girders-elements/_updateRegistry'

describe('updates API', function() {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  const update = app.update

  it('registers an update', function() {
    const action1 = {
      fromKind: ['article', 'specific'],
      type: 'TOGGLE_BOOKMARK',
    }
    const action2 = {
      fromKind: ['article'],
      type: '.LOAD',
    }

    update.register(action1.fromKind, action1.type, () => {})

    update.forKind(action2.fromKind, updates => {
      updates.register(action2.type, () => {})
      updates.register(action2.type, () => {})
    })

    const registry = app.update[registryAttribute]

    expect(
      registry.get(
        ActionRegistry.keyFor(['article', 'specific'], 'TOGGLE_BOOKMARK')
      )
    ).toEqual(expect.anything())

    expect(registry.get(ActionRegistry.keyFor(['article'], '.LOAD'))).toEqual(
      expect.anything()
    )
    expect(
      registry.get(ActionRegistry.keyFor(['article', 'specific'], '.LOAD'))
    ).toEqual(expect.anything())

    expect(
      registry.get(ActionRegistry.keyFor(['article'], 'unknown'))
    ).not.toEqual(expect.anything())
    expect(
      registry.get(ActionRegistry.keyFor(['unknown'], '.LOAD'))
    ).not.toEqual(expect.anything())
  })

  it('reduces the app state according to registrations', function() {
    const app = Subsystem.create(() => ({
      name: 'app',
    }))

    const update = app.update

    const data = fromJS({
      element1: {
        element2: {
          element3: {
            kind: ['article', 'specific'],
          },
          kind: ['container'],
        },
        kind: ['container'],
      },
      kind: 'root',
    })

    const root = Cursor.from(data)
    const el1 = cursor => cursor.get('element1')
    const el2 = cursor => cursor.getIn(['element1', 'element2'])
    const el3 = cursor => cursor.getIn(['element1', 'element2', 'element3'])
    const bookmark = cursor => cursor.get('bookmark')
    const globalBookmark = cursor => cursor.get('globalBookmark')

    const localUpdate = actions.atCursor(el3(root), { type: 'TOGGLE_BOOKMARK' })
    const globalUpdate = actions.atCursor(el1(root), {
      type: '.TOGGLE_BOOKMARK',
    })
    const bubblingUpdate = actions.atCursor(el3(root), {
      type: '.TOGGLE_BOOKMARK',
    })

    update.register(['article', 'specific'], 'TOGGLE_BOOKMARK', e =>
      e.set('bookmark', true)
    )
    update.register('container', '.TOGGLE_BOOKMARK', e =>
      e.set('globalBookmark', true)
    )

    const kernel = Kernel.create([updateSubS, app], {}, {})
    const reducer = kernel.subsystems.update.reducer

    expect(flow(reducer(root, localUpdate), el3, bookmark)).toBe(true)
    expect(flow(reducer(root, globalUpdate), el1, globalBookmark)).toBe(true)
    expect(flow(reducer(root, bubblingUpdate), el2, globalBookmark)).toBe(true)
  })
})
