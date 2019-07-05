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

  it('sends viewportevents on layout and scroll events', () => {
    const cb = jest.fn()

    instance.addViewportListener(cb)
    instance.nodeHandle = 42

    instance._onLayout({
      nativeEvent: {
        layout: {
          height: 40,
          width: 10,
        },
      },
    })

    expect(cb).toHaveBeenLastCalledWith({
      parentHandle: 42,
      viewportOffsetX: 0,
      viewportOffsetY: 0,
      viewportHeight: 40,
      viewportWidth: 10,
      shouldMeasureLayout: true,
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
      parentHandle: 42,
      viewportOffsetX: 10,
      viewportOffsetY: 15,
      viewportWidth: 10,
      viewportHeight: 40,
      shouldMeasureLayout: false,
    })
  })
})
