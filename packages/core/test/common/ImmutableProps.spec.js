'use strict';

import { expect, shallow, spy } from '../support/utils';

import React from 'react';
import I from 'immutable';
import Cursor from 'immutable/contrib/cursor';


import ImmutableProps from '../../src/common/ImmutableProps';
import { mix } from '../../src/vendor/mixwith';


describe('ImmutableProps', function() {

  it("is a mixin", function() {

    class Comp extends mix(React.Component).with(ImmutableProps) {

    }

    expect(Comp.prototype).to.be.instanceof(React.Component);
  });

  it("accepts react components", function() {

    expect(() => class extends mix(React.Component).with(ImmutableProps) {}).not.to.throw();
    expect(() => class extends mix(Object).with(ImmutableProps) {}).to.throw();
  });

  describe(".shouldComponentUpdate()", function() {

    class Comp extends mix(React.Component).with(ImmutableProps) {

      render() {
        return  <div />;
      }
    }

    let willUpdate;

    const el = I.fromJS({
      kind: ['test', 'bla'],
      title: "foo"
    });
    const el2 = el.set("title", "bla").set("another", 32);

    beforeEach(function() {
      willUpdate = spy(Comp.prototype, 'shouldComponentUpdate');
    });

    afterEach(function() {
      willUpdate.restore();
    });

    describe("immutable value handling", function() {
      let mounted;

      beforeEach(function() {
        mounted = shallow(<Comp element={el} />);
      });


      it('prevents an update if the immutable object is the same', function() {
        mounted.setProps({element: el});
        expect(willUpdate).to.have.returned(false);

        mounted.setProps({element: I.fromJS({
          kind: ['test', 'bla'],
          title: "foo"
        })});
        expect(willUpdate).to.have.returned(false);
      });

      it('allows and update when a different immutable object is set', function() {
        mounted.setProps({element: el2});
        expect(willUpdate).to.have.returned(true);
      });

    });

    describe("immutable + primitives handling", function() {

      let mounted;

      beforeEach(function() {
        mounted = shallow(<Comp element={el} string="Hello World" />);
      });

      it("prevents an update when the the element and primitive prop stay the same", function() {
        mounted.setProps({element: el, string: "Hello World"});
        expect(willUpdate).to.have.returned(false);
      });

      it("allows and update when a different primitive prop is set", function() {
        mounted.setProps({element: el, string: "Different String"});
        expect(willUpdate).to.have.returned(true);
      });

    });

    describe("cursor handling", function() {
      // we won't use cursors with callbacks but rather the read + updates feature
      const elCursor = Cursor.from(el);
      const el2Cursor = elCursor.set("title", "bla").set("another", 32);

      let mounted;

      beforeEach(function() {
        mounted = shallow(<Comp element={elCursor} />);
      });

      it ("treats a cursor not the same as its unwrapped value", function() {
        mounted.setProps({element: el});
        expect(willUpdate).to.have.returned(true);
      });

      it ("prevents an update when the same cursor is set", function() {
        mounted.setProps({element: elCursor});
        expect(willUpdate).to.have.returned(false);
      });

      it ("allows an update when the a different cursor is set", function() {
        mounted.setProps({element: el2Cursor});
        expect(willUpdate).to.have.returned(true);
      });


    })
  });
});
