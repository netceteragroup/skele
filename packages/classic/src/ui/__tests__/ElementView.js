'use strict'

import { mount } from 'enzyme'

import * as R from 'ramda'
import React from 'react'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'

import { EntryPoint } from '../../engine'

import { defaultSubsystems } from '../../core'

describe('ElementView', () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  const Scene = ({ element }) => (
    <div>
      {element.get('kind')}: {element.get('text')}
    </div>
  )

  app.ui.register('scene', Scene)

  const capitalize = jest
    .fn()
    .mockImplementation(e => e.update('text', R.toUpper))

  app.update.register('scene', 'capitalize', capitalize)

  let kernel

  beforeEach(() => {
    kernel = Kernel.create([...defaultSubsystems, app], {
      kind: 'nav',
      scenes: [
        {
          kind: 'scene',
          text: 'Scene 1',
        },
        {
          kind: 'c2',
          text: 'Scene 2',
        },
      ],
    })
  })

  afterEach(() => {
    capitalize.mockClear()
  })

  test('dispatched actions from element dispatch are interactive', () => {
    const scene = mount(<EntryPoint kernel={kernel} keyPath={['scenes', 0]} />)

    expect(scene).toIncludeText('scene: Scene 1')

    scene
      .find(Scene)
      .at(0)
      .props()
      .dispatch({ type: 'capitalize' })

    expect(scene).toIncludeText('scene: SCENE 1')

    // expect that the dispatched action has interactive flag set to true
    // the action is the second argument in the update function
    expect(capitalize.mock.calls.length).toBe(1)
    expect(capitalize.mock.calls[0][1].interactive).toBeDefined()
    expect(capitalize.mock.calls[0][1].interactive).toBe(true)
  })

  test('dispatched actions from kernel do not have interactivity defined', () => {
    const scene = mount(<EntryPoint kernel={kernel} keyPath={['scenes', 0]} />)

    expect(scene).toIncludeText('scene: Scene 1')

    kernel.focusOn(['scenes', 0]).dispatch({ type: 'capitalize' })

    expect(scene).toIncludeText('scene: SCENE 1')

    // expect that the dispatched action does not have the interactive flag
    expect(capitalize.mock.calls.length).toBe(1)
    expect(capitalize.mock.calls[0][1].interactive).toBeUndefined()
  })
})
