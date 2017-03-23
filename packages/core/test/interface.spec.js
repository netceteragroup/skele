'use strict';

import { expect } from './support/utils';
import elements, { ui } from '../src';
import uiDirect from '../src/ui';

describe("Girders-Elements interface structure", () => {
  const submodules = [
    'ui',
    'read',
    'update'
  ];

  describe("top level module", () => {
    for (const m of submodules) {
      it ("contains the sub module " + m, () => expect(elements[m]).to.exist);
    }
  });


  describe("importing top level and direct imports", () => {
    describe("the `ui` module", () => {
      it("is can be imported as named import as well as directly using the / notation", () => {
        expect(ui).to.equal(uiDirect);
      });

      it("can also be used from the toplevel module using the . notation", () => {
        expect(elements.ui).to.equal(ui);
      })
    });
  });
});
