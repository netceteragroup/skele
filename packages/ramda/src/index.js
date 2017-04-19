'use strict';

require('core-js/fn/object/assign');

module.exports = {};

Object.assign(module.exports,
  require('ramda'),
  {
    adjust: require('./adjust').default
  }
);
