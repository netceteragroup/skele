'use strict';

import React from 'react';
import { expect, render } from './support/utils';

import * as ui from '../src/ui';

import { List, fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { engine } from '../src/boot';

describe("UI", () => {

  describe("Element UI registration", () => {
    afterEach(() => {
      ui.reset(); // clears all registered components
    });

    describe("Registering a UI component for an element", () => {

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
    })
  });

  describe("Looking Up UI for elements", () => {
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
        const view = engine(fromJS({
          first: {
            kind: 'comp1'
          },
          second: {
            kind: 'comp2'
          }
        }), ({ element }) => {
          return (
            <div>
              <p>Sherlock Holmes</p>
              { ui.forElement(element.get('first')) }
            </div>
          );
        });

        const html = render(view()).html();
        expect(html).to.contain('<div>Watson</div>');
        expect(html).not.to.contain('<div>Hudson</div>');
      });
    });


    describe("#forElements", () => {

      it('returns a list of elements, filtering empty (not found)', () => {
        const view = engine(fromJS({
          detectives: [
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
        }), ({ element }) => {
          return (
            <div>
              { ui.forElements(element.get('detectives')) }
            </div>
          );
        });

        const html = render(view()).html();
        expect(html).to.contain('Watson');
        expect(html).to.contain('Hudson');
        expect(html.match(/<div>/g).length).to.equal(3);
      });
    });
  });


});
