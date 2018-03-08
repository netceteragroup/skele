'use strict'

import { mount } from 'enzyme'

import React from 'react'

import * as propNames from '../../propNames'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import { EntryPoint } from '../../engine'

import uiSubsystem from '..'
import updateSubsystem from '../../update'

const app = Subsystem.create(() => ({
  name: 'app',
}))

const ui = app.ui
const update = app.update

describe('Should component update of element UI', () => {
  const data = {
    kind: 'container',
    [propNames.children]: 'items',
    name: 'A Name',

    items: [
      {
        kind: 'item',
        data: 'a',
      },
      {
        kind: 'item',
        data: 'b',
      },
    ],
  }

  const renderItem = jest.fn()
  renderItem.mockImplementation(({ element }) => (
    <div>Element {element.get('data')}</div>
  ))

  const renderContainer = jest.fn()
  renderContainer.mockImplementation(({ element, uiFor }) => (
    <ul>
      <li>Name: {element.get('name')}</li>
      <li>{uiFor(['items', 0])}</li>
      <li>{uiFor(['items', 1])}</li>
    </ul>
  ))

  afterEach(() => {
    renderItem.mockClear()
    renderContainer.mockClear()
  })

  ui.register('container', renderContainer)
  ui.register('item', renderItem)

  update.register('container', 'rename', (c, { name }) => c.set('name', name))
  update.register('item', 'data', (i, { data }) => i.set('data', data))

  test('when a child changes, all its ancestor rerender', () => {
    const kernel = Kernel.create([updateSubsystem, uiSubsystem, app], data, {})

    mount(<EntryPoint kernel={kernel} keyPath={[]} />)

    expect(renderContainer).toHaveBeenCalledTimes(1)
    expect(renderItem).toHaveBeenCalledTimes(2)

    renderContainer.mockClear()
    renderItem.mockClear()

    kernel.focusOn(['items', 0]).dispatch({ type: 'data', data: 'X' })

    expect(renderContainer).toHaveBeenCalledTimes(1)
    expect(renderItem).toHaveBeenCalledTimes(1)
  })

  test('when ancestor changes, children will not rerender', () => {
    const kernel = Kernel.create([updateSubsystem, uiSubsystem, app], data, {})

    mount(<EntryPoint kernel={kernel} keyPath={[]} />)

    expect(renderContainer).toHaveBeenCalledTimes(1)
    expect(renderItem).toHaveBeenCalledTimes(2)

    renderContainer.mockClear()
    renderItem.mockClear()

    kernel.focusOn([]).dispatch({ type: 'rename', name: 'New Name' })

    expect(renderContainer).toHaveBeenCalledTimes(1)
    expect(renderItem).not.toHaveBeenCalled()
  })

  test('when by-value data remains the same, nothing rerenders', () => {
    const kernel = Kernel.create([updateSubsystem, uiSubsystem, app], data, {})

    mount(<EntryPoint kernel={kernel} keyPath={[]} />)

    expect(renderContainer).toHaveBeenCalledTimes(1)
    expect(renderItem).toHaveBeenCalledTimes(2)

    renderContainer.mockClear()
    renderItem.mockClear()

    kernel.focusOn([]).dispatch({ type: 'rename', name: 'A Name' })

    expect(renderContainer).not.toHaveBeenCalled()
    expect(renderItem).not.toHaveBeenCalled()
  })
})
