'use strict'

import R from 'ramda'
import * as element from './element'

export * from './element'

export { element } // deprecated use

/**
 * Like R.pipe, but the composition is immediately executed using the first arg.
 */
export const flow = (v, ...fs) => R.reduce((x, f) => f(x), v, fs)
export const when = (pred, fn) => (acc, i) => (pred(i) ? fn(acc, i) : acc)
