'use strict'

import { fromJS, List } from 'immutable'

import * as actions from '../../action'
import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import effectSubS from '..'

describe('effects API', function() {
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

  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  const { effect } = app

  describe('Effects', () => {
    const specificEffect = jest.fn()
    const specificEffect2 = jest.fn()
    const specificEffect3 = jest.fn()
    const articleEffect = jest.fn()
    const componentEffect = jest.fn()

    afterEach(() => {
      ;[
        specificEffect,
        specificEffect2,
        specificEffect3,
        articleEffect,
        componentEffect,
      ].forEach(m => m.mockClear())
    })

    // a typical effect that updates the element state when finishing

    effect.register(['article'], 'mark', (context, action) => {
      return el => el.set('marked', action.type)
    })

    effect.register(['article'], 'mark-async', async (context, action) => {
      await sleep(50)
      return el => el.set('marked', action.type)
    })

    effect.forKind(['article', 'specific'], effects => {
      effects.register('toggle', specificEffect)
      effects.register('toggle2', specificEffect2)
      effects.register('toggle3', specificEffect3)

      effects.register('noop', async () => {})
      effects.register('noop2', () => {})
    })

    effect.register(['article'], 'toggle', articleEffect)

    effect.register(['container'], '.toggle', componentEffect)

    effect.register(['container'], 'fireOnSub', async context => {
      context.focusOn(['element3']).dispatch({ type: 'toggle3' })
    })

    describe('effect context', () => {
      const kernel = Kernel.create([effectSubS, app], data, {})

      test('normal action', async () => {
        kernel
          .focusOn(['element1', 'element2', 'element3'])
          .dispatch({ type: 'toggle' })

        await sleep(50)

        expect(specificEffect).toHaveBeenCalled()
        expect(specificEffect2).not.toHaveBeenCalled()
        const [context, action] = specificEffect.mock.calls[
          specificEffect.mock.calls.length - 1
        ]

        expect(action.type).toEqual('toggle')
        expect(actions.actionMeta(action).keyPath).toEqual([
          'element1',
          'element2',
          'element3',
        ])
        expect(context.query().get('kind')).toEqualI(
          List.of('article', 'specific')
        )

        context.dispatch({ type: 'toggle2' })

        await sleep(50)

        expect(specificEffect2).toHaveBeenCalled()
      })

      test('global action', async () => {
        kernel
          .focusOn(['element1', 'element2', 'element3'])
          .dispatch({ type: '.toggle' })

        expect(componentEffect).toHaveBeenCalled()
        const [context, action] = componentEffect.mock.calls[0]

        expect(context.query().get('kind')).toEqualI(List.of('container'))
        expect(actions.actionMeta(action).keyPath).toEqual([
          'element1',
          'element2',
          'element3',
        ])
        expect(context.query()._keyPath).toEqual(['element1', 'element2'])
        expect(action.type).toEqual('.toggle')

        kernel.focusOn(['element1']).dispatch({ type: '.toggle' })

        await sleep(50)

        const [context2, action2] = componentEffect.mock.calls[1]
        expect(context2.query()._keyPath).toEqual(['element1'])
        expect(action2.type).toEqual('.toggle')
      })

      describe('action on sub-element', async () => {
        kernel.focusOn(['element1', 'element2']).dispatch({ type: 'fireOnSub' })

        await sleep(50)

        expect(specificEffect3).toHaveBeenCalled()

        // assert cause (originalAction) preservation
        const action = specificEffect3.mock.calls[0][1]
        const actionMeta = actions.actionMeta(action)
        const { cause } = actionMeta
        expect(cause).toBeDefined()
        expect(cause.type).toBe('fireOnSub')
        expect(action.type).toBe('toggle3')
      })
    })

    describe("Effect's return value", () => {
      const kernel = Kernel.create([effectSubS, app], data, {})

      test('Effect can return an updating fn state => newState', async () => {
        const focus = kernel.focusOn(['element1', 'element2', 'element3'])

        expect(focus.query().get('marked')).not.toEqual('mark')

        focus.dispatch({ type: 'mark' })

        expect(focus.query().get('marked')).toEqual('mark')
      })

      test('An async effect can return an updating fn state => newState', async () => {
        const focus = kernel.focusOn(['element1', 'element2', 'element3'])

        focus.dispatch({ type: 'mark-async' })

        await sleep(25)

        expect(focus.query().get('marked')).not.toEqual('mark-async')

        await sleep(50)

        expect(focus.query().get('marked')).toEqual('mark-async')
      })

      test('An async effect can return undefined', () => {
        const focus = kernel.focusOn(['element1', 'element2', 'element3'])

        focus.dispatch({ type: 'noop2' })
        focus.dispatch({ type: 'noop' })
      })
    })
  })
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
