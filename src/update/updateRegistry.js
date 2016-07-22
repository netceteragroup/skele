'use strict';

import React from 'react';
import Registry from '../common/Registry';

const updateRegistry = new Registry();

// type of updates using definitions: (element, action) => element
export function register(kind, definitions) {
  let elementRegistry = updateRegistry.get(kind);
  if (!elementRegistry) {
    elementRegistry = new Registry();
    updateRegistry.register(kind, elementRegistry);
  }
  definitions(elementRegistry);
  return elementRegistry;
}

export function forAction(action) {
  const elementRegistry = updateRegistry.get(action.kind);
  if (elementRegistry && action.type && action.type !== '@@INIT') {
    const update = elementRegistry.get(action.type);
    if (update) {
      return update;
    }
  }
}
