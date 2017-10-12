'use strict'

/* eslint-disable no-console */
function _warning(msg) {
  if (typeof console !== undefined) {
    if (console.warn != null) {
      console.warn(msg)
    } else if (console.error != null) {
      console.error(msg)
    }
  }
}

function _error(msg, error) {
  if (typeof console !== undefined) {
    if (console.error != null) {
      console.error(msg)
    }
  }
}

/* eslint-enable no-console */

function _noop() {}

let error, warning

let NODE_ENV = process.env.NODE_ENV
if (NODE_ENV !== 'production' && NODE_ENV !== 'test') {
  error = _error
  warning = _warning
} else {
  error = _noop
  warning = _noop
}

export { error, warning }
