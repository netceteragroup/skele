'use strict';

import R from '..';
import {Map, List, fromJS} from 'immutable';

describe('function tagged with `object` work with immutable structures', () => {
  describe('assoc', () => {
    test('works with maps (and any associative)', () => {
      expect(R.assoc('name', 'bla', Map({a: 1}))).toEqualI(Map({name: 'bla', a: 1}));
      expect(R.assoc(1, 'bla', List.of('a', 'b'))).toEqualI(List.of('a', 'bla'));
    });
  });

  describe('assocPath', () => {
    test('works with any associative', () => {
      expect(R.assocPath(['a', 1], 2)(fromJS({a: [100, 200]}))).toEqualI(fromJS({a: [100, 2]}));
      expect(R.assocPath([0, 'a'], 2, fromJS([{a: 100, b: 200}]))).toEqualI(fromJS([{a: 2, b: 200}]));
    });
  });
});
