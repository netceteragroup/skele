'use strict'

import { shallow } from 'enzyme'

import React from 'react'
import I from 'immutable'
import Cursor from 'immutable/contrib/cursor'

import ImmutableProps from '../ImmutableProps'
import { mix } from '../../vendor/mixwith'

describe('ImmutableProps', function() {
  it('is a mixin', function() {
    class Comp extends mix(React.Component).with(ImmutableProps) {
      render() {
        return <div> </div>
      }
    }

    expect(Comp.prototype).toBeInstanceOf(React.Component)
  })

  it('accepts react components', function() {
    expect(
      () => class extends mix(React.Component).with(ImmutableProps) {}
    ).not.toThrow()
    expect(() => class extends mix(Object).with(ImmutableProps) {}).toThrow()
  })

  describe('.shouldComponentUpdate()', function() {
    class Comp extends mix(React.Component).with(ImmutableProps) {
      render() {
        return <div> </div>
      }
    }

    const el = I.fromJS({
      kind: ['test', 'bla'],
      title: 'foo',
    })
    const elCopy = I.fromJS({
      kind: ['test', 'bla'],
      title: 'foo',
    })
    const el2 = el.set('title', 'bla').set('another', 32)

    describe('plain immutable element handling', function() {
      let mounted
      let state

      beforeEach(function() {
        mounted = shallow(<Comp element={el} />)
        state = mounted.instance().state
      })

      it('prevents an update if the next element is identical to the current', function() {
        expect(
          mounted.instance().shouldComponentUpdate({ element: el }, state)
        ).toBe(false)
      })

      it.skip(
        'prevents an update if the next element is equal (value sematics) to the current',
        function() {
          expect(
            mounted.instance().shouldComponentUpdate({ element: elCopy }, state)
          ).toBe(false)
        }
      )

      it('allows and update when a different immutable object is set', function() {
        expect(
          mounted.instance().shouldComponentUpdate({ element: el2 }, state)
        ).toBe(true)
      })
    })

    describe('immutable element + primitives handling', function() {
      let mounted
      let state

      beforeEach(function() {
        mounted = shallow(<Comp element={el} string="Hello World" />)
        state = mounted.instance().state
      })

      it('prevents an update when the the element and primitive prop stay the same', function() {
        expect(
          mounted
            .instance()
            .shouldComponentUpdate(
              { element: el, string: 'Hello World' },
              state
            )
        ).toBe(false)
      })

      it('allows and update when a different primitive prop is set', function() {
        expect(
          mounted
            .instance()
            .shouldComponentUpdate(
              { element: el, string: 'Different String' },
              state
            )
        ).toBe(true)
      })
    })

    describe('cursor element handling', function() {
      // we won't use cursors with callbacks but rather the read + updates feature
      const elCursor = Cursor.from(el)
      const el2Cursor = elCursor.set('title', 'bla').set('another', 32)

      let mounted
      let state

      beforeEach(function() {
        mounted = shallow(<Comp element={elCursor} />)
        state = mounted.instance().state
      })

      it('treats a cursor not the same as its unwrapped value', function() {
        expect(
          mounted.instance().shouldComponentUpdate({ element: el }, state)
        ).toBe(true)
      })

      it('prevents an update when the same cursor is set', function() {
        expect(
          mounted.instance().shouldComponentUpdate({ element: elCursor }, state)
        ).toBe(false)
      })

      it('allows an update when the a different cursor is set', function() {
        expect(
          mounted
            .instance()
            .shouldComponentUpdate({ element: el2Cursor }, state)
        ).toBe(true)
      })
    })
  })
})
