'use strict';

require('core-js/fn/object/assign');
const {dispatch2, dispatch3} = require('./immutable/dispatch');
const {isIndexed, isAssociative, isCollection} = require('./immutable/compat');

module.exports = {};

Object.assign(module.exports,
  require('ramda'),
  {
    adjust: require('./adjust').default,
    all: dispatch2(isIndexed, 'all', 'every'),
    any: dispatch2(isIndexed, 'any', 'some'),
    ap: require('./ap').default,
    aperture: require('./aperture').default,
    append: dispatch2(isIndexed, 'append', 'push'),
    assoc: dispatch3(isAssociative, 'assoc', 'set'),
    assocPath: dispatch3(isAssociative, 'assocPath', 'setIn'),
    chain: dispatch2(isCollection, 'chain', 'flatMap')
  }
);
