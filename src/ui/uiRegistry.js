'use strict';

import React from 'react';
import { Map } from 'immutable';
import invariant from 'invariant';
import isFunction from 'lodash/isFunction';
import { view } from 'redux-elm';

import Registry from '../common/Registry';
import { isElementRef } from '../common/element';
import { isSubclassOf } from '../common/classes';


const uiRegistry = new Registry();

export function register(kind, Component) {
  invariant(
    isElementRef(kind),
    "You must provide a valid element reference to register");
  invariant(
    Component != null && (isSubclassOf(Component, React.Component) || typeof Component === 'function'),
    'You must provide a react component class or a pure-function component'
  );

  // TODO andon: most probably we change with girders-elements view component or we don't wrap here
  const ReduxElmComponent = view(Component);

  uiRegistry.register(kind, ReduxElmComponent);
  return ReduxElmComponent;
}

export function reset() {
  uiRegistry.reset();
}
