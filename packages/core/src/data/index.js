'use strict'

import * as R from 'ramda'

export * from './element'

/**
 * Like R.pipe, but the composition is immediately executed using the first arg.
 */
export const flow = (v, ...fs) => R.reduce((x, f) => f(x), v, fs)

/**
 * when for reduce
 */
export const when = (pred, fn) => (acc, i) => (pred(i) ? fn(acc, i) : acc)
