'use strict'
let invariant

if (process.env.NODE_ENV !== 'production') {
  invariant = function(condition, format, a, b, c, d, e, f) {
    if ((typeof condition === 'function' && !condition()) || !condition) {
      var error
      if (format === undefined) {
        error = new Error(
          'Minified exception occurred; use the non-minified dev environment ' +
            'for the full error message and additional helpful warnings.'
        )
      } else {
        var args = [a, b, c, d, e, f]
        var argIndex = 0
        error = new Error(
          format.replace(/%s/g, function() {
            return args[argIndex++]
          })
        )
        error.name = 'Invariant Violation'
      }

      error.framesToPop = 1 // we don't care about invariant's own frame
      throw error
    }
  }
} else {
  invariant = function() {}
}

export default invariant
