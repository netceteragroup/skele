'use strict'

import 'raf/polyfill'
import 'jest-enzyme'
import I from 'immutable'
import jestFetchMock from 'jest-fetch-mock'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

global.fetch = jestFetchMock

configure({ adapter: new Adapter() })

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

// In Node v7 unhandled promise rejections will terminate the process
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    console.log('Uncaught promise rejection ', reason)
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}
