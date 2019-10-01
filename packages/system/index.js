'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('dist/cjs.production.js')
} else {
  module.exports = require('dist/cjs/development.js')
}
