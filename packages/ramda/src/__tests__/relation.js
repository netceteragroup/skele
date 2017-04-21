'use strict';

import R from '..';
import {Set, List} from 'immutable';

describe('function tagged with `relation` work with immutable structures', () => {
  test('difference', () => {
    expect(R.difference(Set.of(1, 2, 3), Set.of(2))).toEqualI(Set.of(1, 3));
    expect(R.difference(List.of(1, 2, 3), List.of(2))).toEqualI(Set.of(1, 3));
  });
});
