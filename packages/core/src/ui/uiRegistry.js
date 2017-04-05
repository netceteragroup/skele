'use strict';

import React from 'react';
import invariant from 'invariant';

import { Iterable } from 'immutable';

import Registry from '../common/Registry';
import { isElementRef, canonical, isElement, kindOf } from '../common/element';
import { isSubclassOf } from '../common/classes';
import deprecated from '../impl/deprecated';

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

    uiFor = (path, reactKey=undefined) => {
      const { element } = this.props;

      let sub;
      if (Array.isArray(path)) {
        sub = element.getIn(path);
      } else {
        sub = element.get(path);
      }

      return _for(sub, reactKey);
    };

    render() {
      return <Component element={this.props.element} dispatch={this.dispatch} uiFor={this.uiFor} />;
    }
  }

  uiRegistry.register(kind, ElementView);

  return ElementView;
}

function _for(element, reactKey=undefined) {
  if (Iterable.isIndexed(element)) {
    return _forElements(element);
  }

  return _forElement(element, reactKey);
}

function _forElement(element, reactKey=undefined) {
  if (element == null) {
    return null;
  }

  invariant(
    isElement(element),
    "You provided something other than an element for ui lookup");

  invariant(
    element._keyPath != null,
    "The current implementation requires a Cursor to be passed in. This may be removed in the future");

  const kind = kindOf(element);
  const Component = uiRegistry.get(kind);
  if (Component) {
    return <Component element={element} key={reactKey} />;
  }
}

export const forElement =
  deprecated(
    "ui.forElement is deprecated. Use the 'uiFor' prop provided to your element ui",
    _forElement);

function _forElements(elementSeq) {
  return elementSeq.map(_forElement).filter(ui => !!ui);
}

export const forElements =
  deprecated(
    "ui.forElements is deprecated. Use the 'uiFor' prop provided to your element ui",
    _forElements);

export function reset() {
  uiRegistry.reset();
}
