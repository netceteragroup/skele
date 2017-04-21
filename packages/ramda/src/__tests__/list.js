'use strict';

import R from '..';
import {List, OrderedMap, Seq} from 'immutable';

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

  describe('ap', () => {
    test('works with lists as the last arg', () => {
      expect(R.ap([R.multiply(2), R.add(3)], List.of(1, 2, 3))).toEqualI(List.of(2, 4, 6, 4, 5, 6));
    });
  });

  describe('aperture', () => {
    test('works with lists', () => {
      expect(R.aperture(2, List.of(1, 2, 3, 4))).toEqualI(List.of(List.of(1, 2), List.of(3, 4)));
      expect(R.aperture(3, List.of(1, 2))).toEqualI(List.of());
      expect(R.aperture(2, List.of(1, 2, 3))).toEqualI(List.of(List.of(1, 2)));
    });

    test('works with maps', () => {
      const aMap = OrderedMap([['a', 1], ['b', 2], ['c', 3]]);

      expect(R.aperture(2, aMap)).toEqualI(List.of(OrderedMap({a: 1, b: 2})));
    });

    test('works with seqs', () => {
      function* oneToFour() {
        for (let i = 1; i <= 4; i++) {
          yield i;
        }
      }
      const four = Seq(oneToFour());

      expect(R.aperture(2, four)).toEqualI(List.of(List.of(1, 2), List.of(3, 4)));

    });
  });

  describe('append', () => {
    test('works with lists', () => {
      expect(R.append(3, List())).toEqualI(List.of(3));
      expect(R.append(3, List.of(1, 2))).toEqualI(List.of(1, 2, 3));
      expect(R.append(3)(List.of(1))).toEqualI(List.of(1, 3));
    });
  });

  test('chain', () => {
    expect(R.chain(x => [x, x], List.of(1, 2))).toEqualI(List.of(1, 1, 2, 2));
  });

  test('concat', () => {
    expect(R.concat(List.of(1, 2), List.of('a', 'b'))).toEqualI(List.of(1, 2, 'a', 'b'));
    expect(R.concat([1, 2], List.of('a', 'b'))).toEqualI(List.of(1, 2, 'a', 'b'));
    expect(R.concat(List.of(1, 2), ['a', 'b'])).toEqualI(List.of(1, 2, 'a', 'b'));
  });
});
