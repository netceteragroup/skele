'use strict';


import { render } from 'enzyme';

import React from 'react';
import { List, fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { ui, Engine } from '..';

import { isSubclassOf } from '../common/classes';

/*
 * Tests for the ui API.
 */
describe("ui", () => {

  /*
   * Tests for ui.register.
   */
  describe("Element UI registration", () => {
    afterEach(() => {
      ui.reset(); // clears all registered components
    });

    describe("#register", () => {
      it("doesn't accept undefined/null components", () => {
        expect(() => ui.register('component')).toThrow();
        expect(() => ui.register('component', null)).toThrow();
      });

      it("doesn't accept invalid component definitions", () => {
        expect(() => ui.register('component', 'foo')).toThrow();
        expect(() => ui.register('component', 1)).toThrow();
        expect(() => ui.register('component', {})).toThrow();
        expect(() => ui.register()).toThrow();
      });

      it("expects valid element references", () => {
        class Comp extends React.Component {
        }

        expect(() => ui.register(1, Comp)).toThrow();
        expect(() => ui.register(null, Comp)).toThrow();
        expect(() => ui.register(false, Comp)).toThrow();
        expect(() => ui.register({component: "comp"}, Comp)).toThrow();

        expect(() => ui.register('component', Comp)).not.toThrow();
        expect(() => ui.register(['component', 'subkind'], Comp)).not.toThrow();
        expect(() => ui.register(List.of('component', 'subkind'), Comp)).not.toThrow();

      });

      it("accepts react components", () => {
        class Comp extends React.Component {
        }

        expect(() => ui.register('component', Comp)).not.toThrow();
      });

      it("accepts pure-function components", () => {
        function Template() {
          return (
            <div></div>
          );
        }

        expect(() => ui.register('component', Template)).not.toThrow();
      });

      it("returns the registered element UI (not necessarily the same component)", () => {
        class Comp extends React.Component {
        }

        const Klass = ui.register('component', Comp);
        expect(isSubclassOf(Klass, React.Component)).toBeTruthy();
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

      it("Requires a cursor around the element", () => {
        expect(ui.forElement(fromJS({kind: 'comp1'}))).toThrow();
        expect(ui.forElement(Cursor.from(fromJS({kind: 'comp1'})))).toEqual(expect.anything());
      });


      it("returns the corresponding element when looked for", () => {
        const html = render(
          <Engine initState={fromJS({kind: 'comp1'})} />).html();
        expect(html).toContain('<div>Watson</div>');
        expect(html).not.toContain('<div>Hudson</div>');
      });

      it("looks up for an element by resolving the kind canonically", () => {
        // given

        // when
        const htmlWithSpecificRegistered = render(<Engine initState={fromJS({kind: ['comp2', 'specific']})} />).html();
        const htmlWithSpecificUnregistered = render(<Engine initState={fromJS({kind: ['comp1', 'specific']})} />).html();

        // then
        expect(htmlWithSpecificRegistered).toContain('<div>Mycroft</div>');
        expect(htmlWithSpecificRegistered).not.toContain('<div>Hudson</div>');
        expect(htmlWithSpecificUnregistered).toContain('<div>Watson</div>');
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
        expect(html).toContain('Watson');
        expect(html).toContain('Hudson');
        expect(html.match(/<div>/g).length).toEqual(3);
      });
    });
  });


});
