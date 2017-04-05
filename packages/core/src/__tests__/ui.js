'use strict';

import { render, shallow, mount } from 'enzyme';

import React from 'react';
import { Iterable, List, fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { ui, Engine } from '..';
import { kindOf, isOfKind } from '../common/element';

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

    describe('element#uiFor', () => {
      beforeEach(() => {
        ui.register('root', () => <div>Root mounted</div>);
        ui.register('comp1', () => <div className='c1'>Comp1 mounted</div>);
        ui.register('comp2', () => <div className='c2'>Comp2 mounted</div>);
      });
      afterEach(() => {
        ui.reset();
      });

      function implFor(el) {
        let impl = null;

        ui.register(kindOf(el), ({uiFor}) => {
          impl = uiFor;
          return <div></div>;
        });

        mount(ui.forElement(el)); // triggers the renders
        return impl;
      }

      describe('using a key path (string or array)', () => {
        const state = Cursor.from(fromJS({
          kind: 'root',
          child1: {
            'kind': 'comp1',
            items: [
              {
                kind: 'comp2',
                child: {
                  kind: 'comp2'
                }
              },
              {
                kind: 'comp2',
              },
              {
                kind: 'comp3'
              }
            ]
          },
          notAnElement: {
            title: 'foo',
          },
        }));

        let uiFor;
        beforeEach(() => { uiFor = implFor(state) });

        it('renders the ui for the element under the specified sub-key path', () => {
          expect(mount(uiFor('child1'))).toContainReact(<div className='c1'>Comp1 mounted</div>);
        });
        it('renders the ui for the elements under the specified sub-key-path, if said key path is an array', () => {
          expect(mount(uiFor(['child1', 'items', 0, 'child']))).toContainReact(<div className='c2'>Comp2 mounted</div>);
        });
        it('returns undefined if there is no ui registered for the elemnent under the key path', () => {
          expect(uiFor('nonExistingChild') == null).toBe(true);
          expect(uiFor(['child1', 'items', 100]) == null).toBe(true);
        });
        it('returns a list of UI if under there is a List of elements under the specified key path', () => {
          const ui = uiFor(['child1', 'items']);
          expect(Iterable.isIndexed(ui)).toEqual(true);
          expect(mount(ui.get(0))).toContainReact(<div className='c2'>Comp2 mounted</div>);
          expect(mount(ui.get(1))).toContainReact(<div className='c2'>Comp2 mounted</div>);
        });
        it('returns a list of UI elements only for those elements that have a registered UI', () => {
          const ui = uiFor(['child1', 'items']);
          for (let u of ui) {
            expect(isOfKind(['comp3'], u.props.element)).toEqual(false);
          }
        });
        it('throws and error if the data structure under the specified path is not an element', () => {
          expect(() => uiFor('notAnElement')).toThrow();
        });
      });
    });
  });


});
