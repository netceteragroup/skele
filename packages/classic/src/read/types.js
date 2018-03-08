/* @flow */
'use strict'

/**
 * Metadata for a read response.
 */
export type Meta = {
  url: string,
  status: number,
  message: string,
}

/**
 * Read response for successful read.
 */
export type SuccessfulResponse = {
  /**
   * The value of the response can be any JS object. It will be converted to an immutable object if it isn't so.
   */
  value: Object,
  meta: Meta,
}

/**
 * Read response for a failure read.
 */
export type FailureResponse = {
  meta: Meta,
}

/**
 * The response of a read.
 */
export type ReadResponse = SuccessfulResponse | FailureResponse

/**
 * Function that gets an error message and returns a FailureResponse.
 */
export type ErrorFn = (error: string) => FailureResponse

/**
 * Registry key for reads.
 */
export type RegKey = string | Symbol

/**
 * A read can be registered for:
 *
 * - a regular expression (will be executed if the url matches the regex)
 * - predicate (will be executed if the predicate returns true for that url)
 * - a specific url as string
 * - a 'fallback' reader that will handle the default read case
 */
export type ReadDef = RegExp | RegKey | ((x: string) => boolean)

/**
 * A read function is a function that takes an url and returns a promise for a read response.
 */
export type ReadFn = (url: string) => Promise<ReadResponse>
