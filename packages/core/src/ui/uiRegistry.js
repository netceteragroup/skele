'use strict';

import React from 'react';
import invariant from 'invariant';

import { Iterable } from 'immutable';

import Registry from '../common/Registry';
import { isElementRef, canonical, isElement } from '../common/element';
import { isSubclassOf } from '../common/classes';

const uiRegistry = new Registry();

import ImmutableProps from '../common/ImmutableProps';
import { mix } from '../vendor/mixwith';

export function register(kind, Component) {
  invariant(
    isElementRef(kind),
    "You must provide a valid element reference to register");
  invariant(
    Component != null && (isSubclassOf(Component, React.Component) || typeof Component === 'function'),
    "You must provide a react component class or a pure-function component"
  );

  class ElementView extends mix(React.Component).with(ImmutableProps) {

    static propTypes = {
      element: React.PropTypes.object.isRequired
    };

    static contextTypes = {
      store: React.PropTypes.object
    };

    static displayName = `ElementView[${canonical(kind).toJS()}]`;

    constructor(props) {
      super(props);
    }

    dispatch = (action) => {
      const { dispatch } = this.context.store;
      const { element } = this.props;
      const fromKind = canonical(element.get('kind'));
      const fromPath = element._keyPath;
      return dispatch({ ...action, fromKind, fromPath });
    };

    uiFor = (path) => {
      const { element } = this.props;

      let sub;
      if (Array.isArray(path)) {
        sub = element.getIn(path);
      } else {
        sub = element.get(path);
      }

      if (sub == null) {
        return undefined;
      }

      if (Iterable.isIndexed(sub)) {
        return forElements(sub);
      } else if (isElement(sub)) {
        return forElement(sub);
      } else if (sub == null) {
        return null;
      }

      throw new Error("The provided data structure is not an element");
    };

    render() {
      return <Component element={this.props.element} dispatch={this.dispatch} uiFor={this.uiFor} />;
    }
  }

  uiRegistry.register(kind, ElementView);

  return ElementView;
}

export function forElement(element, reactKey) {
  if (element.get && element._keyPath) {
    const fromKind = canonical(element.get('kind'));
    const Component = uiRegistry.get(fromKind);
    if (Component) {
      return <Component element={element} key={reactKey} />;
    }
  }
}

export function forElements(elementSeq) {
  return elementSeq.map(forElement).filter(ui => !!ui);
}

export function reset() {
  uiRegistry.reset();
}
