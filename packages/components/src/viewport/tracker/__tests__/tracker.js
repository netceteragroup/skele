'use strict'

import React from 'react'
import { shallow } from 'enzyme'

import ViewportTracker from '..'

describe('ViewportTracker', () => {
  const instance = shallow(
    <ViewportTracker>
      <div />
    </ViewportTracker>
  ).instance()

  it('sends viewportevents on layout and scrolkl events', () => {
    const cb = jest.fn()

    instance.addViewportListener(cb)

    instance._onLayout({
      nativeEvent: {
        layout: {
          height: 40,
          width: 10,
        },
      },
    })

    expect(cb).toHaveBeenLastCalledWith({
      parentHandle: undefined,
      viewportOffset: 0,
      viewportHeight: 40,
    })

    instance._onScroll({
      nativeEvent: {
        contentOffset: {
          x: 10,
          y: 15,
        },
      },
    })

    expect(cb).toHaveBeenLastCalledWith({
      parentHandle: undefined,
      viewportOffset: 15,
      viewportHeight: 40,
    })
  })
})
