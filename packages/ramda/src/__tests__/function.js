'use strict';

import R from '..';
import {List, Seq, Map, Set} from 'immutable';

describe('function tagged with `function` work with immutable structures', () => {
  test('addIndex', () => {
    const mapIndexed = R.addIndex(R.map);
    expect(
      mapIndexed(
        (v, i) => `${v}-${i}`,
        List.of('a', 'b', 'c')))
      .toEqualI(List.of('a-0', 'b-1', 'c-2'));
  });

  test('empty', () => {
    expect(R.empty(List.of(1, 2))).toEqualI(List());
    expect(R.empty(Map({a: 1, b: 2}))).toEqualI(Map());
    expect(R.empty(Set.of(1, 2, 3))).toEqualI(Set());
    expect(R.empty(Seq([1, 2, 3]))).toEqualI(Seq());
  });

  test('juxt', () => {
    const getRange = R.juxt([Math.min, Math.max]);
    expect(getRange(3, 4, 9, -3)).toEqual([-3, 9]);

    const getR = R.juxt(List.of(Math.min, Math.max));
    expect(getR(3, 4, 9, -3)).toEqualI(List([-3, 9]));

  })
});
