'use strict';

import R from '..';
import {List} from 'immutable';

describe('function tagged with `function` work with immutable structures', () => {
  test('addIndex', () => {
    const mapIndexed = R.addIndex(R.map);
    expect(
      mapIndexed(
        (v, i) => `${v}-${i}`,
        List.of('a', 'b', 'c')))
      .toEqualI(List.of('a-0', 'b-1', 'c-2'));
  });
});
