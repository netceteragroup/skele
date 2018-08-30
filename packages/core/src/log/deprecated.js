'use strict'

import { warning } from './log'

/**
 * This will log a single deprecation notice per function and forward the call
 * on to the new API.
 *
 * @param {string} message The deprecation message.
 * @param {*} ctx The context this forwarded call should run in
 * @param {function} fn The function to forward on to
 * @return {function} The function that will warn once and then call fn
 */
export default function deprecated(message, fn) {
  var warned = false
  if (process.env.NODE_ENV !== 'production') {
    var newFn = function() {
      if (process.env.NODE_ENV !== 'production') {
        if (!warned) {
          warning(message)
          warned = true
        }
        return fn.apply(this, arguments)
      }
    }
    Object.assign(newFn, fn)

    return newFn
  }

  return fn
}
