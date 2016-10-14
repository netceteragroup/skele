'use strict';

import React from 'react';
import invariant from 'invariant';
import { connect } from 'react-redux';

import Registry from '../common/Registry';
import { isElementRef, canonical } from '../common/element';
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
      dispatch: React.PropTypes.func.isRequired,
      element: React.PropTypes.object.isRequired
    };

    constructor(props) {
      super(props);
    }

    dispatch = (action) => {
      const { element } = this.props;
      const fromKind = canonical(element.get('kind'));
      const fromPath = element._keyPath;
      return this.props.dispatch({ ...action, fromKind, fromPath });
    };

    render() {
      return <Component element={this.props.element} dispatch={this.dispatch} />;
    }
  }

  const ConnectedElementView = connect()(ElementView);
  uiRegistry.register(kind, ConnectedElementView);

  return ConnectedElementView;
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
