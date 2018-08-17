'use strict'

/* eslint-disable no-console */

function _info(msg) {
  if (typeof console !== undefined) {
    if (console.log != null) {
      console.log(msg)
    }
  }
}

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
      console.error(msg, error)
    }
  }
}

/* eslint-enable no-console */

function _noop() {}

let info, error, warning

let NODE_ENV = process.env.NODE_ENV
if (NODE_ENV !== 'production' && NODE_ENV !== 'test') {
  info = _info
  error = _error
  warning = _warning
} else {
  info = _noop
  error = _noop
  warning = _noop
}

export { info, error, warning }
