'use strict';

import R from '..';
import {List, Map} from 'immutable';

describe('function tagged with `list` work with immutable structures', () => {
  test('isEmpty', () => {
    expect(R.isEmpty({})).toBe(true);
    
    expect(R.isEmpty(List())).toBe(true);
    expect(R.isEmpty(List.of(1))).toBe(false);
    expect(R.isEmpty(Map())).toBe(true);
    expect(R.isEmpty(Map({a: 1}))).toBe(false);
  });
});
