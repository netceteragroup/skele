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
    });
  });

  describe('all', () => {
    test('works with lists', () => {
      const equals3 = R.equals(3);
      expect(R.all(equals3, List.of(3, 3, 3, 3))).toBe(true);
      expect(R.all(equals3, List.of(3, 2, 3, 2))).toBe(false);
    });
    test('works with arrays', () => {
      const equals3 = R.equals(3);
      expect(R.all(equals3, [3, 3, 3, 3])).toBe(true);
    });
  });

  describe('any', () => {
    test('works with lists', () => {
      const lessThan0 = R.flip(R.lt)(0);
      const lessThan2 = R.flip(R.lt)(2);
      expect(R.any(lessThan0, List.of(1, 2))).toBe(false);
      expect(R.any(lessThan2, List.of(1, 2))).toBe(true);
    });
  });
});
