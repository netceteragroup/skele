'use strict';

import { data } from '..';
const { element } = data;

import { fromJS } from 'immutable';

describe('data', () => {

  // just check if the API is there, the actual tests are elsewhere
  describe('element', () => {
    const el = fromJS({ kind: 'test' });

    test('element module is present', () => {
      expect(element.isOfKind('test', el)).toBeTruthy();
    });
  });
});
