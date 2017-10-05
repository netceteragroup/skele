/* @flow */
'use strict'

import { all, curry } from 'ramda'
import invariant from 'invariant'
import {
  List,
  Seq,
  is,
  Iterable,
  KeyedIterable,
  IndexedIterable,
} from 'immutable'

import type { ElementRef, ElementRefCanonical } from './types'

/**
 * Checks if a given object is of the provided kind.
 *
 * @param kind the kind we are checking
 * @param element the element
 * @returns {*}
 */
export const isOfKind = curry(function isOfKind(
  kind: ElementRef,
  element: ?KeyedIterable
): boolean {
  if (element == null) {
    return false
  }
  const normalized = canonical(kind)
  const elementKindNormalized = canonical(element.get('kind'))

  invariant(normalized != null, 'You must provide a valid element kind')

  invariant(
    elementKindNormalized,
    'You must provide an element that has a valid kind'
  )

  return is(elementKindNormalized.take(normalized.count()), normalized)
})

export function isElementRef(obj: any): boolean {
  const isString = o => typeof o === 'string'

  if (isString(obj)) return true
  if (Array.isArray(obj) && (all(isString)(obj) || obj.length === 0))
    return true
  if (obj instanceof List && (obj.every(isString) || obj.isEmpty())) return true

  return false
}

/**
 * Like isOfKind but checks for exactly the provided type.
 *
 * @param kind the kind
 * @param element tne element
 * @returns {*}
 */
export const isExactlyOfKind = curry(function isExactlyOfKind(
  kind: ElementRef,
  element: ?KeyedIterable
): boolean {
  if (element == null || kindOf(element) == null) {
    return false
  }

  const normalized = normalize(kind)
  const elementKindNormalized = normalize(element.get('kind'))

  return is(elementKindNormalized, normalized)
})

/**
 * Returns the kind of an element.
 *
 * @param element any object, potentially an element
 * @returns the kind of that element or null (which means the provided object is not an element
 */
export function kindOf(element: KeyedIterable): ?ElementRefCanonical {
  const kind: ?ElementRef = element.get('kind')

  if (kind != null) {
    return canonical(kind)
  }

  return null
}

/**
 * Returns true if object provided is an element
 */
export function isElement(obj: any): boolean {
  return Iterable.isIterable(obj) && kindOf(obj) != null
}

/**
 * Given an element kind, returns all ancestor kinds.
 *
 * Eg.e for ['nav'. 'stack', 'modern'] will return a list of
 *
 * [['nav'. 'stack', 'modern'],
 *  ['nav'. 'stack'],
 *  ['nav']]
 *
 * @param ref the kind
 * @returns {*}
 */
export function ancestorKinds(
  ref: ElementRef
): IndexedIterable<ElementRefCanonical> {
  const cRef = canonical(ref)

  invariant(cRef != null, 'you must provide a valid element reference')

  function* subKinds() {
    let current = List(cRef)

    while (current != null && !current.isEmpty()) {
      yield current
      current = current.butLast()
    }
  }

  if (Array.isArray(ref) && ref.length === 0) {
    return List()
  }

  return Seq(subKinds())
}

/**
 * @param ref an element reference
 * @returns the canonical version for the reference kind
 */
export function canonical(ref: ElementRef): ?List<string> {
  return normalize(ref)
}

function normalize(kind): ?List<string> {
  if (typeof kind === 'string') {
    return normalize([kind])
  }

  if (Array.isArray(kind)) {
    return List(kind)
  }

  if (List.isList(kind)) {
    return kind
  }

  if (Seq.isSeq(kind)) {
    return kind.toList()
  }

  return null
}

export function pathsToChildElements(element) {
  return childPositions(element).flatMap(childrenPath =>
    element.get(childrenPath).map((_, i) => List.of(childrenPath, i))
  )
}
/**
 * Property name of for the location where positions of the elements'children
 * can be found
 */
export const childrenProperty = '@@girders-elements/children'

/**
 * Returns the value as a list.
 *
 * @param v The value; can be
 * - a List; the same will be returned
 * - an array, it will be converted in a list
 * - null or undefined => an empty list will be returned
 * - any other value will be wrapped as a single-element list
 */
// eslint-disable-next-line no-nested-ternary
export const asList = v =>
  Iterable.isIndexed(v)
    ? v
    : Array.isArray(v) ? List(v) : v != null ? List.of(v) : List()

/**
 * Returns a list of property names where the element's children may be found
 *
 * @parma the element, the default value
 */
export const childPositions = element => asList(element.get(childrenProperty))
