'use strict';

require('core-js/fn/object/assign');
const {firstArg, lastArg, anyArg, dispatch, pass} = require('./immutable/dispatch');
const {isIndexed, isAssociative, isCollection, is} = require('./immutable/compat');
const {List, Map, Set, Seq} = require('immutable');

const O = require('ramda');
const R = {};
Object.assign(R,
  O,
  {
    adjust: dispatch(3, lastArg(isIndexed), require('./adjust').default, O.adjust),
    all: dispatch(2, lastArg(isCollection), 'every', 'all'),
    any: dispatch(2, lastArg(isCollection), 'some', 'any'),
    ap: dispatch(2,
      (ap, fn) => isIndexed(fn) &&
        (typeof ap.ap !== 'function') &&
        (typeof ap !== 'function'),
      require('./ap').default,
      O.ap),
    aperture: dispatch(2, lastArg(isCollection), require('./aperture').default, O.aperture),
    append: dispatch(2, lastArg(isIndexed), 'push', 'append'),
    assoc: dispatch(3, lastArg(isAssociative), 'set', 'assoc'),
    assocPath: dispatch(3, lastArg(isAssociative), 'setIn', 'assocPath'),
    chain: dispatch(2, lastArg(isCollection), 'flatMap', 'chain'),
    clone: dispatch(1, lastArg(isCollection), O.identity, O.clone),
    concat: dispatch(2, anyArg(isIndexed), (a, b) => List(a).concat(List(b)), O.concat),
    contains: dispatch(2, lastArg(isCollection), 'contains', 'contains'),
    difference: dispatch(2, anyArg(isCollection), (a, b) => Set(a).subtract(Set(b)), O.difference),
    differenceWith: dispatch(3, anyArg(isCollection), require('./differenceWith').default, O.differenceWith),
    dissoc: dispatch(2, lastArg(isAssociative), 'delete', 'dissoc'),
    dissocPath: dispatch(2, lastArg(isAssociative), 'deleteIn', 'dissocPath'),
    dropLast: dispatch(2, lastArg(isIndexed), 'skipLast', 'dropLast'),
    dropLastWhile: dispatch(2, lastArg(isIndexed), require('./dropLastWhile').default, O.dropLastWhile),
    dropRepeatsWith: dispatch(2, lastArg(isIndexed), require('./dropRepeatsWith').default, O.dropRepeatsWith),
    dropWhile: dispatch(2, lastArg(isIndexed), 'skipWhile', 'dropWhile'),
    empty: dispatch(1, [
      [Seq.isSeq,    O.always(Seq())],
      [isCollection, c => c.constructor()],
      [O.T,          O.empty]
    ]),
    equals: dispatch(2, anyArg(isCollection), is, O.equals),
    eqBy: dispatch(3, anyArg(isCollection, O.takeLast(2)), (f, x, y) => is(f(x), f(y)), O.eqBy),
    eqProps: dispatch(3, anyArg(isAssociative, O.takeLast(2)), (p, x, y) => is(x.get(p), y.get(p)), O.eqProps),
    evolve: dispatch(2, lastArg(isAssociative), require('./evolve').default, O.evolve),
    findIndex: dispatch(2, lastArg(isIndexed), 'findIndex', 'findIndex'),
    findLast: dispatch(2, lastArg(isCollection), 'findLast', 'findLast'),
    findLastIndex: dispatch(2, lastArg(isIndexed), 'findLastIndex', 'findLastIndex'),
    flatten: dispatch(1, lastArg(isIndexed), 'flatten', 'flatten'),
    forEachObjIndexed: dispatch(2, lastArg(isAssociative), 'forEach', 'forEachObjIndexed'),
    groupWith: dispatch(2, lastArg(isIndexed), require('./groupWith').default, 'groupWith'),
    has: dispatch(2, lastArg(isAssociative), 'has', 'has'),
    hasIn: dispatch(2, lastArg(isAssociative), 'has', 'hasIn'),
    head: dispatch(1, lastArg(isCollection), 'first', 'head'),
    indexOf: dispatch(2, lastArg(isIndexed), 'indexOf', 'indexOf'),
    init: dispatch(1, lastArg(isCollection), 'butLast', 'init'),
    insert: dispatch(3, lastArg(isIndexed), 'insert', 'insert'),
    insertAll: dispatch(
      3,
      anyArg(isIndexed, O.takeLast(2)),
      (pos, a, b) => List(b).splice(pos, 0, ...(isIndexed(a) ? a.toArray() : a)),
      O.insertAll),
    intersection: dispatch(2, anyArg(isCollection), (a, b) => Set(a).intersect(Set(b)), O.intersection),
    intersectionWith: dispatch(
      3,
      anyArg(isCollection, O.takeLast(2)),
      (pred, a, b) => {
        const first = Set(a);
        const second = Set(b);
        return first.filter(x => second.some(O.partial(pred, [x])));
      },
      O.intersectionWith),
    intersperse: dispatch(2, lastArg(isCollection), 'interpose', 'intersperse'),
    into: dispatch(
      3,
      O.and(firstArg(isCollection), lastArg(isCollection)),
      (acc, xf, list) => {
        const r = O.transduce(xf, (l, v) => isReduced(l) ? l : l.push(v), acc, list);
        return isReduced(r) ? value(r) : r
      },
      O.into),
    invert: dispatch(
      1,
      lastArg(isAssociative),
      (m) => m.reduce((r, v, k) => r.update(v, ks => ks == null ? List.of(String(k)) : ks.push(String(k))), Map()),
      'invert'),
    invertObj: dispatch(1, lastArg(isAssociative), m => m.reduce((r, v, k) => r.set(v, String(k)), Map()), 'invertObj'),
    juxt: dispatch(1, firstArg(isIndexed), (fns) => (...args) => fns.map(f => f(...args)), 'juxt'),
    last: dispatch(1, firstArg(isCollection), 'last', 'last'),
    lastIndexOf: dispatch(2, lastArg(isCollection), 'lastIndexOf', 'lastIndexOf'),
    length: dispatch(1, lastArg(isCollection), 'count', 'length'),
    lift: pass('lift'),
    liftN: pass('liftN'),
    mapAccum: dispatch(
      3,
      lastArg(isCollection),
      (f, zero, list) => list.reduce(
        (acc, el) => {
          let t = List(f(acc.get(0), el));
          return acc.set(0, t.get(0)).update(1, l => l.push(t.get(1)));
        },
        List.of(zero, List())
      ),
      'mapAccum'
    ),
    mapAccumRight: dispatch(
      3,
      lastArg(isCollection),
      (f, zero, list) => list.reduceRight(
        (acc, el) => {
          let t = List(f(el, acc.get(1)));
          return acc.set(1, t.get(1)).update(0, l => l.unshift(t.get(0)));
        },
        List.of(List(), zero)
      ),
      'mapAccumRight'
    ),
    mapObjIndexed: dispatch(2, lastArg(isAssociative), 'map', 'mapObjIndexed'),
    median: dispatch(1, lastArg(isCollection), (l) => R.median(l.toArray()), 'median'),
    merge: dispatch(2, anyArg(isAssociative), (o1, o2) => Map(o1).merge(Map(o2)), 'merge'),
    mergeAll: dispatch(1, firstArg(isIndexed), l => l.reduce((acc, o) => acc.merge(o), Map()), 'mergeAll'),
    mergeWith: dispatch(3, anyArg(isAssociative, O.takeLast(2)), (f, o1, o2) => Map(o1).mergeWith(f, Map(o2)), 'mergeWith'),
    mergeWithKey: dispatch(3, anyArg(isAssociative, O.takeLast(2)), (f, o1, o2) => Map(o1).mergeWith((v1, v2, k) => f(k, v1, v2), Map(o2)), 'mergeWithKey'),

    nth: dispatch(2, lastArg(isIndexed), 'get', 'nth'),
    omit: dispatch(
      2,
      lastArg(isAssociative),
      (keys, l) => {
        if (l.deleteAll != null) return l.deleteAll(keys);

        const keySet = Set(keys);
        return l.filter((v, k) => !keySet.contains(k));
      },
      'omit'),

    path: dispatch(2, lastArg(isAssociative), 'getIn', 'path'),
    pick: dispatch(
      2,
      lastArg(isAssociative),
      (keys, l) => {
        const keySet = Set(keys);
        return l.filter((v, k) => keySet.contains(k))
      },
      'pick'
    ),
    prop: dispatch(2, lastArg(isAssociative), 'get', 'prop'),
    reduce: dispatch(
      2,
      lastArg(isCollection),
      (rf, init, l) => {
        const f = (a, v) => isReduced(a) ? a : rf(a, v);
        const r = O.reduce(f, init, l);
        return isReduced(r) ? value(r) : r;
      },
    'reduce'),
    reduceBy: dispatch(2, lastArg(isCollection), require('./reduceBy').default, 'reduceBy'),
    reject: dispatch(2, lastArg(isCollection), 'filterNot', 'reject'),

    update: dispatch(3, lastArg(isAssociative), 'set', 'update')
  }
);

Object.assign(R,
  {
    dropRepeats: R.dropRepeatsWith(is),
    indexBy: R.reduceBy((acc, e) => e, null),
    isEmpty: dispatch(
      1,
      lastArg(isCollection),
      x => x != null && R.equals(x, R.empty(x)),
     'isEmpty'),
    keys: dispatch(1, lastArg(isAssociative), R.pipe(O.invoker(0, 'keySeq'), R.map(String)), 'keys'),
    lensIndex: (n) => R.lens(R.nth(n), R.update(n)),
    lensPath: (p) => R.lens(R.path(p), R.assocPath(p)),
    lensProp: (k) => R.lens(R.prop(k), R.assoc(k)),
    mean: (l) => R.sum(l) / count(l),
    none: R.complement(R.any),
    partition: dispatch(2, lastArg(isCollection), R.juxt(List.of(R.filter, R.reject)), 'partition'),
    pathEq: dispatch(3, lastArg(isAssociative), (p, v, o) => R.equals(R.path(p, o), v), 'pathEq'),
    pathOr: dispatch(3, lastArg(isAssociative), (d, p, o) => R.defaultTo(d, R.path(p, o)), 'pathOr'),
    pathSatisfies: dispatch(3, lastArg(isAssociative), (pred, path, o) => pred(R.path(path, o)), 'pathSatisfies')
  }
);



Object.assign(R,
{
  keysIn: R.keys
});

function isReduced(v) {
  return v && v['@@transducer/reduced'] != null;
}

function value(v) {
  return v && v['@@transducer/value'];
}

const count = dispatch(1, lastArg(isCollection), 'count', a => a.length);

module.exports = R;
