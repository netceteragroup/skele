'use strict';

import R from '..';
import {Map, List} from 'immutable';

describe('function tagged with `object` work with immutable structures', () => {
  describe('assoc', () => {
    test('works with maps (and any associative)', () => {
      expect(R.assoc('name', 'bla', Map({a: 1}))).toEqualI(Map({name: 'bla', a: 1}));
      expect(R.assoc(1, 'bla', List.of('a', 'b'))).toEqualI(List.of('a', 'bla'));
    });

  });
});
