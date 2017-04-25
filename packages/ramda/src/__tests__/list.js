'use strict';

import R from '..';
import {List, OrderedMap, Seq, fromJS, Map} from 'immutable';

describe('function tagged with `list` work with immutable structures', () => {
  test('adjust', () => {
    expect(R.adjust(R.add(10), 1, List.of(1, 2, 3))).toEqualI(List.of(1, 12, 3));
    expect(R.adjust(R.add(10), -1, List.of(1, 2, 3))).toEqualI(List.of(1, 2, 13));
    expect(R.adjust(R.add(10), 1, [1, 2, 3])).toEqual([1, 12, 3]);
  });

  test('all',  () => {
    const equals3 = R.equals(3);
    expect(R.all(equals3, List.of(3, 3, 3, 3))).toBe(true);
    expect(R.all(equals3, List.of(3, 2, 3, 2))).toBe(false);
    expect(R.all(equals3, [3, 3, 3, 3])).toBe(true);
  });

  test('any', () => {
    const lessThan0 = R.flip(R.lt)(0);
    const lessThan2 = R.flip(R.lt)(2);
    expect(R.any(lessThan0, List.of(1, 2))).toBe(false);
    expect(R.any(lessThan2, List.of(1, 2))).toBe(true);
  });

  test('ap', () => {
    expect(R.ap([R.multiply(2), R.add(3)], List.of(1, 2, 3))).toEqualI(List.of(2, 4, 6, 4, 5, 6));
  });

  test('aperture', () => {
    expect(R.aperture(2, List.of(1, 2, 3, 4))).toEqualI(List.of(List.of(1, 2), List.of(3, 4)));
    expect(R.aperture(3, List.of(1, 2))).toEqualI(List.of());
    expect(R.aperture(2, List.of(1, 2, 3))).toEqualI(List.of(List.of(1, 2)));

    const aMap = OrderedMap([['a', 1], ['b', 2], ['c', 3]])
    expect(R.aperture(2, aMap)).toEqualI(List.of(OrderedMap({a: 1, b: 2})));

    function* oneToFour() {
      for (let i = 1; i <= 4; i++) {
        yield i;
      }
    }
    const four = Seq(oneToFour());

    expect(R.aperture(2, four)).toEqualI(List.of(List.of(1, 2), List.of(3, 4)));
  });

  test('append', () => {
    expect(R.append(3, List())).toEqualI(List.of(3));
    expect(R.append(3, List.of(1, 2))).toEqualI(List.of(1, 2, 3));
    expect(R.append(3)(List.of(1))).toEqualI(List.of(1, 3));
  });

  test('chain', () => {
    expect(R.chain(x => [x, x], List.of(1, 2))).toEqualI(List.of(1, 1, 2, 2));
  });

  test('concat', () => {
    expect(R.concat(List.of(1, 2), List.of('a', 'b'))).toEqualI(List.of(1, 2, 'a', 'b'));
    expect(R.concat([1, 2], List.of('a', 'b'))).toEqualI(List.of(1, 2, 'a', 'b'));
    expect(R.concat(List.of(1, 2), ['a', 'b'])).toEqualI(List.of(1, 2, 'a', 'b'));
  });

  test('contains', () => {
    expect(R.contains(1, List.of(1, 2))).toBe(true);
    expect(R.contains(1, List.of(3, 2))).toBe(false);
    expect(R.contains(List.of(1), fromJS([1, [1]]))).toBe(true);
    expect(R.contains([1], fromJS([1, [1]]))).toBe(false);
    expect(R.contains([1], List.of([1, [1]]))).toBe(false);
  });

  test('drop', () => {
    expect(R.drop(1, List.of(1, 2))).toEqualI(List.of(2));
    expect(R.drop(2, List.of(1, 2))).toEqualI(List());
    expect(R.drop(3, List.of(1, 2))).toEqualI(List());
  });

  test('dropLast', () => {
    expect(R.dropLast(1, List.of(1, 2, 3))).toEqualI(List.of(1, 2));
    expect(R.dropLast(2, List.of(1, 2, 3))).toEqualI(List.of(1));
    expect(R.dropLast(3, List.of(1, 2, 3))).toEqualI(List());
    expect(R.dropLast(4, List.of(1, 2, 3))).toEqualI(List());
  });

  test('dropLastWhile', () => {
    expect(R.dropLastWhile(x => x <= 3, List.of(1, 2, 3, 4, 3, 2, 1))).toEqualI(List.of(1, 2, 3, 4));
  });

  test('dropRepeats', () => {
    expect(R.dropRepeats(List([1, 1, 1, 2, 3, 4, 4, 2, 2]))).toEqualI(List([1, 2, 3, 4, 2]));
  });

  test('dropRepeatsWith', () => {
    const l = List([1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3]);
    expect(R.dropRepeatsWith(R.eqBy(Math.abs), l)).toEqualI(List([1, 3, 4, -5, 3]));
  });

  test('dropWhile', () => {
    const lteTwo = x => x <= 2;
    expect(R.dropWhile(lteTwo, List([1, 2, 3, 4, 3, 2, 1]))).toEqualI(List([3, 4, 3, 2, 1]));
  });

  test('filter', () => {
    const even = x => x % 2 === 0;
    expect(R.filter(even, List.of(1, 2, 3, 4))).toEqualI(List.of(2, 4));
  });

  test('find',  () => {
    const even = x => x % 2 === 0;
    expect(R.find(even, List.of(1, 2, 3, 4))).toEqual(2);
  });

  test('findIndex', () => {
    const even = x => x % 2 === 0;
    expect(R.findIndex(even, List.of(1, 2, 3, 4))).toEqual(1);
    expect(R.findIndex(even, List.of(1, 1, 1, 1))).toEqual(-1);
  });

  test('findLast', () => {
    const even = x => x % 2 === 0;
    expect(R.findLast(even, List.of(1, 2, 3, 4))).toEqual(4);
    expect(R.findLast(even, List.of(1, 1, 1, 1))).toBeUndefined();
  });

  test('findLastIndex', () => {
    const even = x => x % 2 === 0;
    expect(R.findLastIndex(even, List.of(1, 2, 3, 4))).toEqual(3);
    expect(R.findLastIndex(even, List.of(1, 1, 1, 1))).toEqual(-1);
  });

  test('flatten', () => {
    const list = [1, 2, [3, 4], 5, [6, [7, 8, [9, [10, 11], 12]]]];
    const flattened = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    expect(R.flatten(list)).toEqual(flattened);
    expect(R.flatten(fromJS(list))).toEqualI(List(flattened));
  });

  test('forEach', () => {
    let sumA = 0, sumI = 0;
    const nums = [1, 2, 3];

    R.forEach(v => sumA += v, nums);
    expect(sumA).toEqual(6);

    R.forEach(v => sumI += v, List(nums));
    expect(sumI).toEqual(6);
  });

  test('forEachObjIndexed', () => {
    let keysA = [], keysI = [];
    let obj =  {a: 1, b: 2};

    R.forEachObjIndexed((v, k) => keysI.push(k), Map(obj));
    expect(keysI).toEqual(['a', 'b']);

    R.forEachObjIndexed((v, k) => keysA.push(k), obj);
    expect(keysA).toEqual(['a', 'b']);
  });

  test('groupBy', () => {
    let byGrade = R.groupBy(function(student) {
      var score = student.score ? student.score : student.get('score');
      return score < 65 ? 'F' :
             score < 70 ? 'D' :
             score < 80 ? 'C' :
             score < 90 ? 'B' : 'A';
    });
    let students = [{name: 'Abby', score: 84},
                    {name: 'Eddy', score: 58},
                    {name: 'Jack', score: 69}];

    const result = {
     'B': [{name: 'Abby', score: 84}],
     'D': [{name: 'Jack', score: 69}],
     'F': [{name: 'Eddy', score: 58}]
   };

    expect(byGrade(students)).toEqual(result);
    expect(Map(byGrade(fromJS(students)))).toEqualI(fromJS(result));
  });

  test('groupWith', () => {
    const list = [0, 1, 1, 2, 3, 5, 8, 13, 21];
    const result = [[0], [1, 1], [2], [3], [5], [8], [13], [21]];

    expect(R.groupWith(R.equals, list)).toEqual(result);
    expect(List(R.groupWith(R.equals, List(list)))).toEqualI(fromJS(result));
  });

  test('head', () => {
    expect(R.head(List.of(1, 2))).toEqual(1);
    expect(R.head(List())).toBeUndefined();
  });

  test('indexBy', () => {
    const list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
    const result = {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}};

    expect(R.indexBy(R.prop('id'), list)).toEqual(result);
    expect(R.indexBy(R.prop('id'), fromJS(list))).toEqualI(fromJS(result));
  });

  test('indexOf', () => {
    const list = ['a', 'b', 'c'];

    expect(R.indexOf('b', list)).toEqual(1);

    expect(R.indexOf('b', List(list))).toEqual(1);
    expect(R.indexOf('bla', List(list))).toEqual(-1);
  });

  test('init', () => {
    expect(R.init([1, 2, 3])).toEqual([1, 2]);

    expect(R.init(List.of(1, 2, 3))).toEqualI(List.of(1, 2));
    expect(R.init(List.of(1))).toEqualI(List());
    expect(R.init(List())).toEqualI(List());
  })
});
