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

  test('prop', () => {
    const obj = {
      a: 1,
      b: 2
    };
    const arr = ['x', 'y'];

    expect(R.prop('a', obj)).toEqual(1);

    expect(R.prop('a', Map(obj))).toEqual(1);
    expect(R.prop('x')(Map(obj))).toBeUndefined();

    expect(R.prop(1, List(arr))).toEqual('y');
  });

  test('invert', () => {
    const raceResultsByFirstName = {
      first: 'alice',
      second: 'jake',
      third: 'alice',
    };
    const result = { 'alice': ['first', 'third'], 'jake':['second'] };

    expect(R.invert(raceResultsByFirstName)).toEqual(result);
    expect(R.invert(fromJS(raceResultsByFirstName))).toEqualI(fromJS(result));
  });

  test('invertObj', () => {
    const raceResults1 = {
      first: 'alice',
      second: 'jake'
    };
    const result1 = { 'alice': 'first', 'jake':'second' };


    const raceResults2 = ['alice', 'jake'];
    const result2 = { 'alice': '0', 'jake': '1' };


    expect(R.invertObj(raceResults1)).toEqual(result1);
    expect(R.invertObj(Map(raceResults1))).toEqualI(Map(result1));

    expect(R.invertObj(raceResults2)).toEqual(result2);
    expect(R.invertObj(List(raceResults2))).toEqualI(Map(result2));
  });

  test('keys', () => {
    const obj = {a: 1, b: 2, c: 3};
    const arr = ['x', 'y', 'z'];

    expect(R.keys(obj)).toEqual(['a', 'b', 'c']);
    expect(List(R.keys(Map(obj)))).toEqual(List.of('a', 'b', 'c'));
    expect(List(R.keys(List(arr)))).toEqualI(List.of('0', '1', '2'));
  });

  test('lens', () => {
    const obj = {a: 1, b: 3};
    const aLens = R.lens(R.prop('a'), R.assoc('a'));

    expect(R.view(aLens, obj)).toEqual(1);
    expect(R.view(aLens, Map(obj))).toEqual(1);
    expect(R.over(aLens, R.negate, Map(obj))).toEqualI(Map({a: -1, b: 3}));
  });

  test('lensIndex', () => {
    const arr = ['a', 'b', 'c'];
    const second = R.lensIndex(1);

    expect(R.view(second, arr)).toEqual('b');
    expect(R.view(second, List(arr))).toEqual('b');
    expect(R.over(second, R.toUpper, List(arr))).toEqualI(List.of('a', 'B', 'c'));
  });

  test('lensPath', () => {
    const obj = {a: 1, b: {c: 2}};
    const cLens = R.lensPath(['b', 'c']);

    expect(R.view(cLens, obj)).toEqual(2);
    expect(R.view(cLens, fromJS(obj))).toEqual(2);
    expect(R.over(cLens, R.negate, fromJS(obj))).toEqualI(fromJS({a: 1, b: {c: -2}}));
  });

  test('lensProp', () => {
    const obj = {a: 1, b: 3};
    const aLens = R.lensProp('a');

    expect(R.view(aLens, obj)).toEqual(1);
    expect(R.view(aLens, Map(obj))).toEqual(1);
    expect(R.over(aLens, R.negate, Map(obj))).toEqualI(Map({a: -1, b: 3}));
  });

  test('mapObjectIndexed', () => {
     const values = { x: 1, y: 2, z: 3 };
     const prependKeyAndDouble = (num, key) => key + (num * 2);

     expect(R.mapObjIndexed(prependKeyAndDouble, values)).toEqual({ x: 'x2', y: 'y4', z: 'z6' });
     expect(R.mapObjIndexed(prependKeyAndDouble, Map(values))).toEqualI(Map({ x: 'x2', y: 'y4', z: 'z6' }));

  });

  test('merge', () => {
    const obj1 = { 'name': 'fred', 'age': 10 };
    const obj2 = { 'age': 40 };
    const expected = { 'name': 'fred', 'age': 40 };

    expect(R.merge(obj1, obj2)).toEqual(expected);
    expect(R.merge(Map(obj1), obj2)).toEqualI(Map(expected));
    expect(R.merge(obj1, Map(obj2))).toEqualI(Map(expected));
    expect(R.merge(Map(obj1), Map(obj2))).toEqualI(Map(expected));
  });

  test('mergeAll', () => {
     const lists = [{foo: 1}, {foo: 2, bar: 2}, {baz: 3}];
     const expected = {foo: 2, bar:2, baz: 3};

     expect(R.mergeAll(lists)).toEqual(expected);
     expect(R.mergeAll(fromJS(lists))).toEqualI(Map(expected));
  });

  test('mergeWith', () => {
    const obj1 = { a: true, values: [10, 20] };
    const obj2 = { b: true, values: [15, 35] };
    const expected = { a: true, b: true, values: [10, 20, 15, 35] };

    expect(R.mergeWith(R.concat, obj1, obj2)).toEqual(expected);
    expect(R.mergeWith(R.concat, fromJS(obj1), obj2)).toEqualI(fromJS(expected));
    expect(R.mergeWith(R.concat, obj1, fromJS(obj2))).toEqualI(fromJS(expected));
    expect(R.mergeWith(R.concat, fromJS(obj1), fromJS(obj2))).toEqualI(fromJS(expected));
  });

  test('mergeWithKey',  () => {
    const concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r;
    const obj1 = { a: true, thing: 'foo', values: [10, 20] };
    const obj2 = { b: true, thing: 'bar', values: [15, 35] };
    const expected = { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] };

    expect(R.mergeWithKey(concatValues, obj1, obj2)).toEqual(expected);
    expect(R.mergeWithKey(concatValues, fromJS(obj1), obj2)).toEqualI(fromJS(expected));
    expect(R.mergeWithKey(concatValues, obj1, fromJS(obj2))).toEqualI(fromJS(expected));
    expect(R.mergeWithKey(concatValues, fromJS(obj1), fromJS(obj2))).toEqualI(fromJS(expected));
  });

  test('omit', () => {
    expect(R.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4})).toEqual({b: 2, c: 3});
    expect(R.omit(['a', 'd'], Map({a: 1, b: 2, c: 3, d: 4}))).toEqualI(Map({b: 2, c: 3}));
    expect(R.omit(List(['a', 'd']), Map({a: 1, b: 2, c: 3, d: 4}))).toEqualI(Map({b: 2, c: 3}));
  });

  test('pathOr', () => {
    expect(R.pathOr('N/A', ['a', 'b'], {a: {b: 2}})).toEqual(2);
    expect(R.pathOr('N/A', ['a', 'b'], {c: {b: 2}})).toEqual('N/A');

    expect(R.pathOr('N/A', ['a', 'b'], fromJS({a: {b: 2}}))).toEqual(2);
    expect(R.pathOr('N/A', ['a', 'b'], fromJS({c: {b: 2}}))).toEqual('N/A');
  });

  test('pick', () => {
    expect(R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4})).toEqual({a: 1, d: 4});
    expect(R.pick(['a', 'd'], Map({a: 1, b: 2, c: 3, d: 4}))).toEqualI(Map({a: 1, d: 4}));
  });

  test('pickAll', () => {
    expect(R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3})).toEqual({a: 1, d: undefined});
    expect(R.pickAll(['a', 'd'], Map({a: 1, b: 2, c: 3}))).toEqualI(Map({a: 1, d: undefined}));
  });

  test('pickBy', () => {
    const  isUpperCase = (val, key) => key.toUpperCase() === key;

    expect(R.pickBy(isUpperCase, {a: 1, b: 2, A: 3, B: 4})).toEqual({A: 3, B: 4});
    expect(R.pickBy(isUpperCase, Map({a: 1, b: 2, A: 3, B: 4}))).toEqualI(Map({A: 3, B: 4}));
  });

  test('pluck', () => {
    expect(R.pluck('a', [{a: 1}, {a: 2}])).toEqual([1, 2]);
    expect(R.pluck(0)([[1, 2], [3, 4]])).toEqual([1, 3]);

    expect(R.pluck('a', fromJS([{a: 1}, {a: 2}]))).toEqualI(List([1, 2]));
    expect(R.pluck(0, List([[1, 2], [3, 4]]))).toEqualI(List([1, 3]));
  });
});
