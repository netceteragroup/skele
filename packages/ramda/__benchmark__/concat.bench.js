var concat = require('..').concat
var oConcat = require('ramda').concat
var I = require('immutable')

var s1 = [8, 2, 85, 2, 34, 3, 23]
var s2 = [247, 57, 8, 0, 6, 5, 46, 54, 643]

var i1 = I.fromJS(s1)
var i2 = I.fromJS(s2)

var concatS1 = concat(s1)

module.exports = {
  name: 'concat',

  tests: {
    'concat(s1, s2)': function() {
      concat(s1, s2)
    },
    'concat(i1, i2)': function() {
      concat(i1, i2)
    },
    'concat(s1, s2) [ramda]': function() {
      oConcat(s1, s2)
    },
    'i1.concat(i2)': function() {
      i1.concat(i2)
    },
    'native concat': function() {
      s1.concat(s2)
    },
  },
}
