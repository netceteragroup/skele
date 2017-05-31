'use strict';

import R from '..';
import {List, Map, fromJS} from 'immutable';

describe('function tagged with `logic` work with immutable structures', () => {
  test('isEmpty', () => {
    expect(R.isEmpty({})).toBe(true);

    expect(R.isEmpty(List())).toBe(true);
    expect(R.isEmpty(List.of(1))).toBe(false);
    expect(R.isEmpty(Map())).toBe(true);
    expect(R.isEmpty(Map({a: 1}))).toBe(false);
  });

  test('pathSatisfies', () => {
    expect(R.pathSatisfies(y => y > 0, ['x', 'y'], {x: {y: 2}})).toBe(true);
    expect(R.pathSatisfies(y => y > 0, ['x', 'y'], fromJS({x: {y: 2}}))).toBe(true);
  });
});
