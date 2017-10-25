'use strict'

import * as Kernel from '../kernel'
import * as SubSystem from '../subsystem'

import { fromJS } from 'immutable'

describe('Kernel', () => {
  const emptyKernel = Kernel.create([], {}, {})
  const uiKernel = Kernel.create([], { ui: { kind: 'scene' } })
  const kernelWithSubSystem = Kernel.create(
    [
      SubSystem.create(() => ({
        name: 'tab',
        hello() {
          return 'hello from tab'
        },
      })),
    ],
    { status: { kind: 'bar' } },
    {}
  )

  it('allows listening on actions', () => {
    const listener = jest.fn()

    // dispatch an action in the system and assert that nothing changed
    emptyKernel.dispatch({ type: 'action' })
    expect(listener.mock.calls.length).toBe(0)

    // subscribe to listen for actions that happen in the system
    emptyKernel.subscribe(listener)

    // assert that there is a change (listener was called)
    emptyKernel.dispatch({ type: 'action' })
    expect(listener.mock.calls.length).toBe(1)
  })

  it('can query the state by path', () => {
    const ui = uiKernel.query(['ui'])
    expect(ui).toEqualI(fromJS({ kind: 'scene' }))

    const kind = uiKernel.query(['ui', 'kind'])
    expect(kind).toEqual('scene')
  })

  it('can have focus on element in path', () => {
    const tab = kernelWithSubSystem.focusOn(['status'])
    expect(tab.query(['kind'])).toEqual('bar')
    expect(tab.subsystems).toBeTruthy()
    expect(tab.subsystemSequence.length).toEqual(1)
    expect(tab.elementZipper).toBeTruthy()
    expect(tab.config).toEqual({})

    const listener = jest.fn()
    tab.subscribe(listener)
    tab.dispatch({ type: 'action' })
    expect(listener.mock.calls.length).toBe(1)
  })

  it('can have sub-system from middleware', () => {
    const checker = jest.fn()
    const middleware = store => next => action => {
      if (action.type === 'murder') checker('has happened')
      return next(action)
    }
    const theKernel = Kernel.create(
      [SubSystem.fromMiddleware(middleware)],
      { ui: { kind: 'mistery' } },
      {}
    )
    theKernel.dispatch({ type: 'not-a-murder' })
    expect(checker.mock.calls.length).toBe(0)
    theKernel.dispatch({ type: 'murder' })
    expect(checker.mock.calls.length).toBe(1)
  })
})
