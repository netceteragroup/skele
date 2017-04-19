'use strict';

import R from '..';
import {List} from 'immutable';

describe('function tagged with `list` work with immutable structures', () => {
  describe('adjust', () => {
    test('works with lists', () => {
      expect(R.adjust(R.add(10), 1, List.of(1, 2, 3))).toEqualI(List.of(1, 12, 3));
    });
    test('works with negative indicews', () => {
      expect(R.adjust(R.add(10), -1, List.of(1, 2, 3))).toEqualI(List.of(1, 2, 13));
    });
    test('works with arrays', () => {
      expect(R.adjust(R.add(10), 1, [1, 2, 3])).toEqual([1, 12, 3]);
    })
  })

});
