'use strict'

import 'jest-enzyme'
import I from 'immutable'

expect.extend({
  toEqualI(received, expected) {
    const pass = I.is(received, expected)

    if (pass) {
      return {
        pass,
        message: () =>
          this.utils.matcherHint('.not.toEqualI') +
          '\n\n' +
          'Expected value not to equal (using I.is):\n' +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}`,
      }
    } else {
      return {
        pass,
        message: () =>
          this.utils.matcherHint('.toEqualI') +
          '\n\n' +
          'Expected value equal (using I.is):\n' +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}`,
      }
    }
  },
})
