'use strict';

import React from 'react';
import invariant from 'invariant';
import { connect } from 'react-redux';
import createElement from 'recompose/createElement';

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

  uiRegistry.register(kind, Component);
  return Component;
}
export function forElement(element, reactKey) {
  const kind = element.get('kind').toJS();
  const path = element._keyPath;
  const Component = uiRegistry.get(kind); // TODO andon: maybe use recognizer when creating the registry
  if (Component) {
    const UI = connect()(class GirdersElementView extends React.Component {

      static propTypes = {
        dispatch: React.PropTypes.func.isRequired
      };

      constructor(props) {
        super(props);
      }

      render() {
        const dispatch = (action) => {
          return this.props.dispatch({
            ...action,
            kind,
            path
          });
        };
        return createElement(Component, { ...this.props, element, dispatch })
      }
    });
    return <UI key={reactKey} />;
  }
}

export function forElements(elementSeq) {
  return elementSeq.map(forElement).filter(ui => !!ui);
}

export function reset() {
  uiRegistry.reset();
}
