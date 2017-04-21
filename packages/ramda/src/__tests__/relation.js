'use strict';

import R from '..';
import {Set, List, Map, fromJS} from 'immutable';

describe('function tagged with `relation` work with immutable structures', () => {
  test('difference', () => {
    expect(R.difference(Set.of(1, 2, 3), Set.of(2))).toEqualI(Set.of(1, 3));
    expect(R.difference(List.of(1, 2, 3), List.of(2))).toEqualI(Set.of(1, 3));
  });

  test('differenceWith', () => {
    const a = Set.of(Map({a: 1, b: 100}), Map({a: 2, b: 200}));
    const b = Set.of(Map({a: 1, b: 11}));

    expect(R.differenceWith((x, y) => x.get('a') === y.get('a'), a, b)).toEqualI(Set.of(Map({a: 2, b: 200})));
  });

  test('eqBy', () => {
    expect(R.eqBy(Math.abs, 5, -5)).toBe(true);
    expect(R.eqBy(Math.abs, List.of(5), List.of(-5))).toBe(true);
  });

  test('equals', () => {
    expect(R.equals(1, 1)).toBe(true);
    expect(R.equals(1, '1')).toBe(false);
    expect(R.equals([1, 2, {a: 3}], [1, 2, {a: 3}])).toBe(true);

    expect(R.equals([1, 2, {a: 3}], fromJS([1, 2, {a: 3}]))).toBe(false);
    expect(R.equals(fromJS([1, 2, {a: 3}]), [1, 2, {a: 3}])).toBe(false);
    expect(R.equals(fromJS([1, 2, {a: 3}]), fromJS([1, 2, {a: 3}]))).toBe(true);


  });
});
