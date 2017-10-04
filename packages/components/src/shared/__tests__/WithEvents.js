'use strict'

import React from 'react'
import { shallow } from 'enzyme'
import WithEvents from '../WithEvents'

describe('WithEvents ', () => {
  describe('a single event', () => {
    class TestComponent extends React.Component {
      render() {
        return <div> </div>
      }
    }
    const TestComponentWithEvents = WithEvents('change', TestComponent)

    const instance = shallow(<TestComponentWithEvents />).instance()

    const callback = jest.fn()

    it('supports adding, removing and notifying listeners', () => {
      instance.addChangeListener(callback)
      instance.notifyChangeListeners('x')

      expect(callback).toHaveBeenCalled()

      callback.mockClear()

      instance.removeChangeListener(callback)
      instance.notifyChangeListeners('y')

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('a singleEvent with custom props', () => {
    class TestComponent extends React.Component {
      render() {
        return <div> </div>
      }
    }
    const TestComponentWithEvents = WithEvents(
      {
        name: 'change',
        inChildContext: true,
        addMethod: 'justAdd',
      },
      TestComponent
    )

    const instance = shallow(<TestComponentWithEvents />).instance()
    const callback = jest.fn()

    it('supports adding, removing and notifying listeners', () => {
      instance.justAdd(callback)
      instance.notifyChangeListeners('x')

      expect(callback).toHaveBeenCalled()

      callback.mockClear()

      instance.removeChangeListener(callback)
      instance.notifyChangeListeners('y')

      expect(callback).not.toHaveBeenCalled()
    })

    it('exposes the add / remove methods in child context', () => {
      const childContext = instance.getChildContext()
      expect(childContext.justAdd).toBe(instance.justAdd)
      expect(childContext.removeChangeListener).toBe(
        instance.removeChangeListener
      )
    })
  })

  describe('multiple events', () => {
    class TestComponent extends React.Component {
      render() {
        return <div> </div>
      }
    }
    const TestComponentWithEvents = WithEvents(
      [
        {
          name: 'change',
          inChildContext: true,
        },
        {
          name: 'viewport',
          inChildContext: false,
        },
      ],
      TestComponent
    )

    const instance = shallow(<TestComponentWithEvents />).instance()
    const callback = jest.fn()

    it('supports both events', () => {
      instance.addChangeListener(callback)
      instance.addViewportListener(callback)

      instance.notifyChangeListeners('x')
      instance.notifyViewportListeners('y')

      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('exposes just the specified event in child context', () => {
      const childContext = instance.getChildContext()

      expect(childContext.addChangeListener).toBeDefined()
      expect(childContext.addViewportListener).not.toBeDefined()
    })
  })
})
