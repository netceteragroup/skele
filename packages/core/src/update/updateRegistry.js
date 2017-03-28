'use strict';

import invariant from 'invariant';
import Registry from '../common/Registry';
import { isElementRef } from '../common/element';

const updateRegistry = new Registry();

// type of updates using definitions: (element, action) => element
export function register(kind, definitions) {
  invariant(
    isElementRef(kind),
    "You must provide a valid element reference to register");

  let elementRegistry = updateRegistry.get(kind);
  if (!elementRegistry) {
    elementRegistry = new Registry();
    updateRegistry.register(kind, elementRegistry);
  }

  definitions(elementRegistry);

  return elementRegistry;
}

export function forAction(action) {
  return forKindAndType(action.fromKind, action.type);
}

export function forKindAndType(kind, type) {
  const elementRegistry = updateRegistry.get(kind);
  if (elementRegistry && type) {
    const update = elementRegistry.get(type);
    if (update) {
      return update;
    }
  }
}

export function reset() {
  updateRegistry.reset();
}
