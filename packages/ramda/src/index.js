'use strict';

require('core-js/fn/object/assign');
const {dispatch2, dispatch3} = require('./immutable/dispatch');
const {isIndexed, isAssociative, isCollection} = require('./immutable/compat');

module.exports = {};

Object.assign(module.exports,
  require('ramda'),
  {
    adjust: require('./adjust').default,
    all: dispatch2(isCollection, 'all', 'every'),
    any: dispatch2(isCollection, 'any', 'some'),
    ap: require('./ap').default,
    aperture: require('./aperture').default,
    append: dispatch2(isIndexed, 'append', 'push'),
    assoc: dispatch3(isAssociative, 'assoc', 'set'),
    assocPath: dispatch3(isAssociative, 'assocPath', 'setIn'),
    chain: dispatch2(isCollection, 'chain', 'flatMap'),
    clone: require('./clone').default,
    concat: require('./concat').default,
    contains: dispatch2(isCollection, 'contains', 'contains'),
    difference: require('./difference').default,
    differenceWith: require('./differenceWith').default,
    dissoc: dispatch2(isAssociative, 'dissoc', 'delete'),
    dissocPath: dispatch2(isAssociative, 'dissocPath', 'deleteIn'),
    dropLast: dispatch2(isIndexed, 'dropLast', 'skipLast')
  }
);
