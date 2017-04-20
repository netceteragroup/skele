'use strict';

require('core-js/fn/object/assign');
const {dispatch2} = require('./immutable/dispatch');
const {isIndexed} = require('./immutable/compat');

module.exports = {};

Object.assign(module.exports,
  require('ramda'),
  {
    adjust: require('./adjust').default,
    all: dispatch2(isIndexed, 'all', 'every'),
    any: dispatch2(isIndexed, 'any', 'some'),
    ap: require('./ap').default
  }
);
