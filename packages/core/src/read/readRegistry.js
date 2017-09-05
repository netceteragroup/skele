/* @flow */
'use strict'

import { List } from 'immutable'
import R from 'ramda'

import {
  // SuccessfulResponse,
  // FailureResponse,
  // RegKey,
  ReadDef,
  ReadFn,
} from './types'

/**
 * symbol identifying the fallback read. Use it to register a fallback read
 *
 *     read.register(read.fallback, read.httpRead);
 *
 * @type {Symbol}
 */
export const fallback: Symbol = Symbol('fallback')

/**
 * Registers a read.
 */
export const register = R.curry(function register(
  registry,
  pattern: ReadDef,
  read: ReadFn
): void {
  let adapted: ReadFn = read

  if (pattern instanceof RegExp) {
    const regexp = pattern
    registry.register((u: List) => u.first().match(regexp) != null, adapted)
  } else {
    registry.register(pattern, adapted)
  }
})

export const get = R.curry(function get(registry, pattern: ReadDef): ReadFn {
  return registry.get(pattern)
})

const mergeRegistries = (a, b) => a.recognizers.append(b.recognizers)

export const buildRegistry = registries =>
  R.count(registries) === 0
    ? new Registry()
    : R.count(registries) === 1
      ? registries[0]
      : R.reduce(mergeRegistries, new Registry(), registries)
