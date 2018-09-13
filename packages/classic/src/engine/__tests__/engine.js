'use strict'

import { mount } from 'enzyme'

import * as R from 'ramda'
import I from 'immutable'

import React from 'react'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'

import { EntryPoint, Engine } from '..'

import { defaultSubsystems } from '../../core'
import { ui, update, propNames } from '../..'

describe('Engine: wiring everything together', () => {
  describe('EntryPoint', () => {
    const app = Subsystem.create(() => ({
      name: 'app',
    }))

    const Foo = ({ element }) => (
      <div>
        {element.get('kind')}: {element.get('text')}
      </div>
    )

    app.ui.register('c1', Foo)
    app.ui.register('c2', Foo)

    const capitalize = e => e.update('text', R.toUpper)
    const capitalizeTitles = n => n.update('scenes', ss => ss.map(capitalize))

    app.update.register('nav', '.capitalize', capitalizeTitles)
    app.update.register('c1', 'capitalize', capitalize)

    let kernel
    beforeEach(() =>
      (kernel = Kernel.create([...defaultSubsystems, app], {
        kind: 'nav',
        scenes: [
          {
            kind: 'c1',
            text: 'Scene 1',
          },
          {
            kind: 'c2',
            text: 'Scene 2',
          },
        ],
      })))

    test('multiple entrypoints can be linked with a single kernel inst.', () => {
      const ep1 = mount(<EntryPoint kernel={kernel} keyPath={['scenes', 0]} />)
      const ep2 = mount(<EntryPoint kernel={kernel} keyPath={['scenes', 1]} />)

      expect(ep1).toIncludeText('c1: Scene 1')
      expect(ep2).toIncludeText('c2: Scene 2')
    })

    test('updates work accross different entrypoints', () => {
      const ep1 = mount(<EntryPoint kernel={kernel} keyPath={['scenes', 0]} />)
      const ep2 = mount(<EntryPoint kernel={kernel} keyPath={['scenes', 1]} />)

      ep1
        .find(Foo)
        .at(0)
        .props()
        .dispatch({ type: 'capitalize' })

      expect(ep1).toIncludeText('c1: SCENE 1')

      ep1
        .find(Foo)
        .at(0)
        .props()
        .dispatch({ type: '.capitalize' })

      expect(ep2).toIncludeText('c2: SCENE 2')
    })
  })

  describe('Entrypoint with mixins', () => {
    const Wrapper = Superclass =>
      class extends Superclass {
        render() {
          return <section id="wrapper">{super.render()}</section>
        }
      }

    const app = Subsystem.create(() => ({
      name: 'app',
      engineMixins: [Wrapper],
    }))

    const Foo = ({ element }) => (
      <div>
        {element.get('kind')}: {element.get('text')}
      </div>
    )

    app.ui.register('c1', Foo)

    const kernel = Kernel.create([...defaultSubsystems, app], {
      kind: 'c1',
      text: 'wrapped',
    })

    test('mixins are applied around the entrypoint', () => {
      const e = mount(<EntryPoint kernel={kernel} keyPath={[]} />)
      expect(e.find('section#wrapper')).toBePresent()
    })
  })

  describe('Subtree rerender optimization', () => {
    const app = Subsystem.create(() => ({
      name: 'app',
    }))

    const data = {
      kind: 'container',
      [propNames.children]: 'items',
      name: 'A',

      items: [
        {
          kind: 'container',
          name: 'B',
          [propNames.children]: 'items',

          items: [
            {
              kind: 'item',
              data: 'a',
            },
          ],
        },
        {
          kind: 'container',
          name: 'C',
          items: [],
        },
        {
          kind: 'item',
          data: 'b',
        },
      ],
    }

    const renderItem = jest.fn()
    renderItem.mockImplementation(({ element }) => (
      <div className="item" id={element.get('data')}>
        Element {element.get('data')}
      </div>
    ))

    const renderContainer = jest.fn()
    renderContainer.mockImplementation(({ element, uiFor }) => (
      <ul className="container" id={element.get('name')}>
        <li>Name: {element.get('name')}</li>
        {I.Range(0, element.get('items').count()).map(i => (
          <li key={i}>{uiFor(['items', i])}</li>
        ))}
      </ul>
    ))

    afterEach(() => {
      renderItem.mockClear()
      renderContainer.mockClear()
    })

    app.ui.register('container', renderContainer)
    app.ui.register('item', renderItem)

    const addFoo = x => x.set('foo', 'bar')

    app.update.register('item', 'addFoo', addFoo)
    app.update.register('container', 'addFoo', addFoo)

    // tests

    test('by default, the app re-renders from the top when a child changes', () => {
      const kernel = Kernel.create([...defaultSubsystems, app], data)

      const e = mount(<EntryPoint kernel={kernel} keyPath={[]} />)

      expect(renderContainer).toHaveBeenCalledTimes(3)
      expect(renderItem).toHaveBeenCalledTimes(2)

      renderItem.mockClear()
      renderContainer.mockClear()

      kernel.focusOn(['items', 0, 'items', 0]).dispatch({ type: 'addFoo' })

      // two containers and the item re-rendered in the hierarchy

      expect(renderContainer).toHaveBeenCalledTimes(2)
      expect(renderItem).toHaveBeenCalledTimes(1)
    })

    test('when the optimization is turned on, only the affected sub-tree is rendered', () => {
      const kernel = Kernel.create([...defaultSubsystems, app], data, {
        optimizations: {
          subtreeRerender: true, // <---- the optimization flag!
        },
      })

      const e = mount(<EntryPoint kernel={kernel} keyPath={[]} />)

      expect(renderContainer).toHaveBeenCalledTimes(3)
      expect(renderItem).toHaveBeenCalledTimes(2)

      renderItem.mockClear()
      renderContainer.mockClear()

      kernel.focusOn(['items', 0, 'items', 0]).dispatch({ type: 'addFoo' })

      // two containers and the item re-rendered in the hierarchy

      expect(renderContainer).toHaveBeenCalledTimes(0)
      expect(renderItem).toHaveBeenCalledTimes(1)
    })

    test('EntryPoint re-renders when ancestor changes')

    test('ElementView changes impl. when element kind changes')

    test('ElementView rerenders when hinted sub-element is hit')
  })

  describe('Engine', () => {
    afterEach(() => {
      ui.reset()
    })

    const twiddlingMiddleware = R.curry((store, next, action) => {
      let nextAction
      if (action.type === 'twiddle') {
        nextAction = { ...action, type: 'capitalize' }
      } else {
        nextAction = action
      }
      return next(nextAction)
    })

    test('classic use (deprecations expected)', () => {
      const Foo = ({ element }) => <div>Hello from {element.get('text')}</div>
      ui.register('s1', Foo)

      update.register('s1', updates => {
        updates.register('capitalize', e => e.update('text', R.toUpper))
      })

      const e = mount(<Engine initState={{ kind: 's1', text: 's1' }} />)
      expect(e).toIncludeText('Hello from s1')

      e.find(Foo)
        .at(0)
        .props()
        .dispatch({ type: 'capitalize' })

      expect(e).toIncludeText('Hello from S1')
    })

    test('custom middleware', () => {
      const Foo = ({ element }) => <div>Hello from {element.get('text')}</div>
      ui.register('m1', Foo)

      update.register('m1', updates => {
        updates.register('capitalize', e => e.update('text', R.toUpper))
      })

      const e = mount(
        <Engine
          initState={{ kind: 'm1', text: 'm1' }}
          customMiddleware={[twiddlingMiddleware]}
        />
      )

      expect(e).toIncludeText('Hello from m1')

      e.find(Foo)
        .at(0)
        .props()
        .dispatch({ type: 'twiddle' })

      expect(e).toIncludeText('Hello from M1')
    })
    test('additionalSubsystems', () => {
      const Foo = ({ element }) => <div>Hello from {element.get('text')}</div>
      ui.register('ss1', Foo)

      update.register('ss1', updates => {
        updates.register('capitalize', e => e.update('text', R.toUpper))
      })

      const twiddler = Subsystem.create(() => ({
        name: 'twiddler',
        middleware: twiddlingMiddleware,
      }))

      const e = mount(
        <Engine
          initState={{ kind: 'ss1', text: 'ss1' }}
          additionalSubsystems={[twiddler]}
        />
      )

      expect(e).toIncludeText('Hello from ss1')

      e.find(Foo)
        .at(0)
        .props()
        .dispatch({ type: 'twiddle' })

      expect(e).toIncludeText('Hello from SS1')
    })

    test('subsystems', () => {
      const Foo = ({ element }) => <div>Hello from {element.get('text')}</div>
      ui.register('ssx1', Foo)

      update.register('ssx1', updates => {
        updates.register('capitalize', e => e.update('text', R.toUpper))
      })

      const twiddler = Subsystem.create(() => ({
        name: 'twiddler',
        middleware: twiddlingMiddleware,
      }))

      const e = mount(
        <Engine
          initState={{ kind: 'ssx1', text: 'ssx1' }}
          subsystems={[...defaultSubsystems, twiddler]}
        />
      )

      expect(e).toIncludeText('Hello from ssx1')

      e.find(Foo)
        .at(0)
        .props()
        .dispatch({ type: 'twiddle' })

      expect(e).toIncludeText('Hello from SSX1')
    })
  })
})
