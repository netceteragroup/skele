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

  test('mean', () => {
    expect(R.mean([2, 7, 9])).toEqual(6);
    expect(R.mean([])).toEqual(0.0/0.0);

    expect(R.mean(List.of(2, 7, 9))).toEqual(6);
    expect(R.mean(List())).toEqual(0.0/0.0);

  });

  test('pathEq', () => {
    var user1 = { address: { zipCode: 90210 } };
    var user2 = { address: { zipCode: 55555 } };
    var user3 = { name: 'Bob' };
    var users = [ user1, user2, user3 ];
    var isFamous = R.pathEq(['address', 'zipCode'], 90210);

    expect(R.filter(isFamous, users)).toEqual([ user1 ]);
    expect(R.filter(isFamous, fromJS(users))).toEqualI(fromJS([ user1 ]));

  });

  test('propEq', () => {
    const abby = {name: 'Abby', age: 7, hair: 'blond'};
    const fred = {name: 'Fred', age: 12, hair: 'brown'};
    const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
    const alois = {name: 'Alois', age: 15, disposition: 'surly'};
    const kids = [abby, fred, rusty, alois];
    const hasBrownHair = R.propEq('hair', 'brown');

    expect(R.filter(hasBrownHair, kids)).toEqual([fred, rusty]);
    expect(R.filter(hasBrownHair, fromJS(kids))).toEqualI(fromJS([fred, rusty]));
  });

  test('propIs', () => {
    expect(R.propIs(Number, 'x', {x: 1, y: 2})).toBe(true);
    expect(R.propIs(Number, 'x', {x: 'foo'})).toBe(false);
    expect(R.propIs(Number, 'x', {})).toBe(false);

    expect(R.propIs(Number, 'x', Map({x: 1, y: 2}))).toBe(true);
    expect(R.propIs(Number, 'x', Map({x: 'foo'}))).toBe(false);
    expect(R.propIs(Number, 'x', Map())).toBe(false);
  })
});
