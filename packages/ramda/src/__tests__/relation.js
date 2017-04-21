'use strict';

import R from '..';
import {Set, List, Map} from 'immutable';

describe('function tagged with `relation` work with immutable structures', () => {
  test('difference', () => {
    expect(R.difference(Set.of(1, 2, 3), Set.of(2))).toEqualI(Set.of(1, 3));
    expect(R.difference(List.of(1, 2, 3), List.of(2))).toEqualI(Set.of(1, 3));
  });

  test('differenceWith', () => {
    const a = Set.of(Map({a: 1, b: 100}), Map({a: 2, b: 200}));
    const b = Set.of(Map({a: 1, b: 11}));

    expect(R.differenceWith((x, y) => x.get('a') === y.get('a'), a, b)).toEqualI(Set.of(Map({a: 2, b: 200})));
  })
});
