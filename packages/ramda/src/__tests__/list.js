'use strict';

import R from '..';
import {List, OrderedMap, Seq, fromJS} from 'immutable';

describe('function tagged with `list` work with immutable structures', () => {
  test('adjust', () => {
    expect(R.adjust(R.add(10), 1, List.of(1, 2, 3))).toEqualI(List.of(1, 12, 3));
    expect(R.adjust(R.add(10), -1, List.of(1, 2, 3))).toEqualI(List.of(1, 2, 13));
    expect(R.adjust(R.add(10), 1, [1, 2, 3])).toEqual([1, 12, 3]);
  });

  test('all',  () => {
    const equals3 = R.equals(3);
    expect(R.all(equals3, List.of(3, 3, 3, 3))).toBe(true);
    expect(R.all(equals3, List.of(3, 2, 3, 2))).toBe(false);
    expect(R.all(equals3, [3, 3, 3, 3])).toBe(true);
  });

  test('any', () => {
    const lessThan0 = R.flip(R.lt)(0);
    const lessThan2 = R.flip(R.lt)(2);
    expect(R.any(lessThan0, List.of(1, 2))).toBe(false);
    expect(R.any(lessThan2, List.of(1, 2))).toBe(true);
  });

  test('ap', () => {
    expect(R.ap([R.multiply(2), R.add(3)], List.of(1, 2, 3))).toEqualI(List.of(2, 4, 6, 4, 5, 6));
  });

  test('aperture', () => {
    expect(R.aperture(2, List.of(1, 2, 3, 4))).toEqualI(List.of(List.of(1, 2), List.of(3, 4)));
    expect(R.aperture(3, List.of(1, 2))).toEqualI(List.of());
    expect(R.aperture(2, List.of(1, 2, 3))).toEqualI(List.of(List.of(1, 2)));

    const aMap = OrderedMap([['a', 1], ['b', 2], ['c', 3]])
    expect(R.aperture(2, aMap)).toEqualI(List.of(OrderedMap({a: 1, b: 2})));

    function* oneToFour() {
      for (let i = 1; i <= 4; i++) {
        yield i;
      }
    }
    const four = Seq(oneToFour());

    expect(R.aperture(2, four)).toEqualI(List.of(List.of(1, 2), List.of(3, 4)));
  });

  test('append', () => {
    expect(R.append(3, List())).toEqualI(List.of(3));
    expect(R.append(3, List.of(1, 2))).toEqualI(List.of(1, 2, 3));
    expect(R.append(3)(List.of(1))).toEqualI(List.of(1, 3));
  });

  test('chain', () => {
    expect(R.chain(x => [x, x], List.of(1, 2))).toEqualI(List.of(1, 1, 2, 2));
  });

  test('concat', () => {
    expect(R.concat(List.of(1, 2), List.of('a', 'b'))).toEqualI(List.of(1, 2, 'a', 'b'));
    expect(R.concat([1, 2], List.of('a', 'b'))).toEqualI(List.of(1, 2, 'a', 'b'));
    expect(R.concat(List.of(1, 2), ['a', 'b'])).toEqualI(List.of(1, 2, 'a', 'b'));
  });

  test('contains', () => {
    expect(R.contains(1, List.of(1, 2))).toBe(true);
    expect(R.contains(1, List.of(3, 2))).toBe(false);
    expect(R.contains(List.of(1), fromJS([1, [1]]))).toBe(true);
    expect(R.contains([1], fromJS([1, [1]]))).toBe(false);
    expect(R.contains([1], List.of([1, [1]]))).toBe(false);
  });

  test('drop', () => {
    expect(R.drop(1, List.of(1, 2))).toEqualI(List.of(2));
    expect(R.drop(2, List.of(1, 2))).toEqualI(List());
    expect(R.drop(3, List.of(1, 2))).toEqualI(List());
  });

  test('dropLast', () => {
    expect(R.dropLast(1, List.of(1, 2, 3))).toEqualI(List.of(1, 2));
    expect(R.dropLast(2, List.of(1, 2, 3))).toEqualI(List.of(1));
    expect(R.dropLast(3, List.of(1, 2, 3))).toEqualI(List());
    expect(R.dropLast(4, List.of(1, 2, 3))).toEqualI(List());
  });

});
