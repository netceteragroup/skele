'use strict';

import invariant from 'invariant';

import Registry from '../common/MultivalueRegistry';
import { isElementRef } from '../data/element';

import R from 'ramda';

import { postWalk } from 'zippa'
import ImmutableZipper from '../zip/ImmutableZipper'

const transformerRegistry = new Registry();


export function register(kind, transformer) {
  invariant(
    isElementRef(kind),
    "You must provide a valid element reference to register");
  invariant(
    transformer != null && typeof transformer === 'function',
    "You must provide a transformer function"
  );

  transformerRegistry.register(kind, transformer);
}

export function get(kind) {
  return transformerRegistry.get(kind)
}


function transform(element) {
  // get all transformers registered for this kind
  const transformers = get(element.get('kind'))

  // if no transformers are defined for the element, just return the same element
  if (!transformers) {
    return element
  }

  const transformFn = transformers.length === 1 ? transformers : R.pipe(...transformers)
  return transformFn(element)
}

export function apply(element, childrenElements = 'content') {
  const zipper = new ImmutableZipper(element, childrenElements).zipper
  return postWalk(transform, zipper)
}

export function reset() {
  transformerRegistry.reset();
}
