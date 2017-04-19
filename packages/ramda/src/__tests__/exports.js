'use strict';

import R, {map} from '..';
import * as RR from '..';

describe('Ramda is re-exported so that', () => {
  test("functions can be accessed via the default export", () => {
    expect(R.map(x => x + 1, [1, 2, 3])).toEqual([2, 3, 4]);
  });

  test('functions can be imported directly with { } (named exports)', () => {
    expect(map(x => x + 1, [1, 2, 3])).toEqual([2, 3, 4]);
  });

  test('functions can be imported with the * as syntax', () => {
    expect(RR.map(x => x + 1, [1, 2, 3])).toEqual([2, 3, 4]);
  });
});
