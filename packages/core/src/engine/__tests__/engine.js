'use strict'

import { mount } from 'enzyme'

import R from 'ramda'
import React from 'react'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'

import { EntryPoint, Engine } from '..'

import { defaultSubsystems } from '../../core'
import { ui, update } from '../..'

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
    beforeEach(
      () =>
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
        }))
    )

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

      e
        .find(Foo)
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

      e
        .find(Foo)
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

      e
        .find(Foo)
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

      e
        .find(Foo)
        .at(0)
        .props()
        .dispatch({ type: 'twiddle' })

      expect(e).toIncludeText('Hello from SSX1')
    })
  })
})
