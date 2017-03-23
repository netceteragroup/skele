'use strict';

import React from 'react';
import { expect, render } from './support/utils';

import * as ui from '../src/ui';

import { List, fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { Engine } from '../src';

/*
 * Tests for the ui API.
 */
describe("UI", () => {

  /*
   * Tests for ui.register.
   */
  describe("Element UI registration", () => {
    afterEach(() => {
      ui.reset(); // clears all registered components
    });

    describe("#register", () => {
      it("doesn't accept undefined/null components", () => {
        expect(() => ui.register('component')).to.throw();
        expect(() => ui.register('component', null)).to.throw();
      });

      it("doesn't accept invalid component definitions", () => {
        expect(() => ui.register('component', 'foo')).to.throw();
        expect(() => ui.register('component', 1)).to.throw();
        expect(() => ui.register('component', {})).to.throw();
        expect(() => ui.register()).to.throw();
      });

      it("expects valid element references", () => {
        class Comp extends React.Component {
        }

        expect(() => ui.register(1, Comp)).to.throw();
        expect(() => ui.register(null, Comp)).to.throw();
        expect(() => ui.register(false, Comp)).to.throw();
        expect(() => ui.register({component: "comp"}, Comp)).to.throw();

        expect(() => ui.register('component', Comp)).not.to.throw();
        expect(() => ui.register(['component', 'subkind'], Comp)).not.to.throw();
        expect(() => ui.register(List.of('component', 'subkind'), Comp)).not.to.throw();

      });

      it("accepts react components", () => {
        class Comp extends React.Component {
        }

        expect(() => ui.register('component', Comp)).not.to.throw();
      });

      it("accepts pure-function components", () => {
        function Template() {
          return (
            <div></div>
          );
        }

        expect(() => ui.register('component', Template)).not.to.throw();
      });

      it("returns the registered element UI (not necessarily the same component)", () => {
        class Comp extends React.Component {
        }

        expect(ui.register('component', Comp)).to.exist;
      });
    });

  });

  /*
   * Tests for ui.forElement and ui.forElements.
   */
  describe("Element UI Lookup", () => {
    beforeEach(() => {
      ui.register('comp1', () => {
        return (
          <div>Watson</div>
        );
      });
      ui.register('comp2', () => {
        return (
          <div>Hudson</div>
        );
      });
      ui.register(['comp2', 'specific'], () => {
        return (
          <div>Mycroft</div>
        );
      });
      ui.register('detectives', ({ element }) => {
        return (
          <div>
            { ui.forElements(element.get('list')) }
          </div>
        )
      })
    });
    afterEach(() => {
      ui.reset(); // clears all registered components
    });

    describe("#forElement", () => {

      it("returns element only when data model is represented with cursors", () => {
        expect(ui.forElement(fromJS({kind: 'comp1'}))).not.to.exist;
        expect(ui.forElement(Cursor.from(fromJS({kind: 'comp1'})))).to.exist;
      });


      it("returns the corresponding element when looked for", () => {
        const html = render(
          <Engine initState={fromJS({kind: 'comp1'})} />).html();
        expect(html).to.contain('<div>Watson</div>');
        expect(html).not.to.contain('<div>Hudson</div>');
      });

      it("looks up for an element by resolving the kind canonically", () => {
        // given

        // when
        const htmlWithSpecificRegistered = render(<Engine initState={fromJS({kind: ['comp2', 'specific']})} />).html();
        const htmlWithSpecificUnregistered = render(<Engine initState={fromJS({kind: ['comp1', 'specific']})} />).html();

        // then
        expect(htmlWithSpecificRegistered).to.contain('<div>Mycroft</div>');
        expect(htmlWithSpecificRegistered).to.not.contain('<div>Hudson</div>');
        expect(htmlWithSpecificUnregistered).to.contain('<div>Watson</div>');
      });
    });


    describe("#forElements", () => {

      it('returns a list of elements, filtering empty (not found)', () => {
        const html = render(<Engine initState={fromJS({
          kind: 'detectives',
          list: [
            {
              kind: 'comp1'
            },
            {
              kind: 'comp2'
            },
            {
              kind: 'not-registered'
            }
          ]
        })} />).html();
        expect(html).to.contain('Watson');
        expect(html).to.contain('Hudson');
        expect(html.match(/<div>/g).length).to.equal(3);
      });
    });
  });


});
