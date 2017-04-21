'use strict';

import R from '..';
import {Map, List, fromJS} from 'immutable';

describe('function tagged with `object` work with immutable structures', () => {
  test('assoc', () => {
    expect(R.assoc('name', 'bla', Map({a: 1}))).toEqualI(Map({name: 'bla', a: 1}));
    expect(R.assoc(1, 'bla', List.of('a', 'b'))).toEqualI(List.of('a', 'bla'));
  });

  test('assocPath', () => {
    expect(R.assocPath(['a', 1], 2)(fromJS({a: [100, 200]}))).toEqualI(fromJS({a: [100, 2]}));
    expect(R.assocPath([0, 'a'], 2, fromJS([{a: 100, b: 200}]))).toEqualI(fromJS([{a: 2, b: 200}]));
  });

  test('clone', () => {
    const l = List.of(1, 2, 3);
    expect(R.clone(l)).toBe(l);
    expect(R.clone([1, 2])).toEqual([1, 2]);
  });

  test('dissoc', () => {
    expect(R.dissoc('a', Map({a: 1, b: 2}))).toEqualI(Map({b: 2}));
    expect(R.dissoc(1, List.of(1, 2))).toEqualI(List.of(1));
  });

  test('dissocPath', () => {
    const struct = fromJS({
      a: {
        b: 1,
        c: [100, 200]
      }
    });
    const list = fromJS([1, {a: 2}]);

    expect(R.dissocPath(['a', 'c', 0], struct)).toEqualI(fromJS({a: {b: 1, c: [200]}}));
    expect(R.dissocPath([1, 'a'], list)).toEqualI(fromJS([1, {}]));
  });

  test('eqProps', () => {
    const o1 = { a: 1, b: 2, c: 3, d: 4 };
    const o2 = { a: 10, b: 20, c: 3, d: 40 };
    expect(R.eqProps('a', o1, o2)).toBe(false);
    expect(R.eqProps('c', o1, o2)).toBe(true);
    expect(R.eqProps('a', Map(o1), Map(o2))).toBe(false);
    expect(R.eqProps('c', Map(o1), Map(o2))).toBe(true);
  });

  test('evolve', () => {
    const tomato  = fromJS({firstName: '  Tomato ', data: {elapsed: 100, remaining: 1400}, id:123});
    const transformations = {
      firstName: R.trim,
      lastName: R.trim, // Will not get invoked.
      data: {elapsed: R.add(1), remaining: R.add(-1)}
    };

    expect(R.evolve(transformations, tomato)).toEqualI(fromJS({firstName: 'Tomato', data: {elapsed: 101, remaining: 1399}, id:123}));
  });

  test('has', () => {
    const obj = {
      a: 1,
      b: 2
    };

    expect(R.has('a', obj)).toBe(true);
    expect(R.has('c', obj)).toBe(false);
    expect(R.has('a', Map(obj))).toBe(true);
    expect(R.has('c', Map(obj))).toBe(false);
  });

});
