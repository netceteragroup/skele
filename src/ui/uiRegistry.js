'use strict';

import React from 'react';
import invariant from 'invariant';

import Registry from '../common/Registry';
import { isElementRef, canonical } from '../common/element';
import { isSubclassOf } from '../common/classes';

const uiRegistry = new Registry();

import ImmutableProps from '../common/ImmutableProps';
import { mix } from '../vendor/mixwith';

import I from 'immutable';
export function register(kind, Component) {
  invariant(
    isElementRef(kind),
    "You must provide a valid element reference to register");
  invariant(
    Component != null && (isSubclassOf(Component, React.Component) || typeof Component === 'function'),
    "You must provide a react component class or a pure-function component"
  );


  if (!isSubclassOf(Component, React.Component) && Component.displayName == null) {
    Component.displayName = `Element(${canonical(kind).join(',')}`;
  }

  class ElementView extends React.Component {

    static propTypes = {
      element: React.PropTypes.object.isRequired
    };

    static contextTypes = {
      store: React.PropTypes.object,
      registerElementViewForPath: React.PropTypes.func,
      unregisterElementViewForPath: React.PropTypes.func
    };

    // The rules for element keeping are:
    // - the effective element is in the state
    // - it is updated whenver we receive instruction via forceElementUpdate
    // - the keypath props.element and state.element is always the same

    constructor(props) {
      super(props);

      this.state = { element: props.element };
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !I.is(this.props.element, nextProps.element) || !I.is(this.state.element, nextState.element);
    }


    dispatch = (action) => {
      const { dispatch } = this.context.store;
      const { element } = this.state;
      const fromKind = canonical(element.get('kind'));
      const fromPath = element._keyPath;
      return dispatch({ fromKind, fromPath, ...action });
    };

    componentWillReceiveProps(nextProps) {
      this.setState(state => ({element: nextProps.element}));
    }

    componentWillMount() {
      const keyPath = this.state.element._keyPath;

      this.context.registerElementViewForPath(this, keyPath);
    }

    componentWillUpdate(nextProps) {
      this.context.unregisterElementViewForPath(this, this.props.element._keyPath);
      this.context.registerElementViewForPath(this, nextProps.element._keyPath);
    }

    componentWillUnmount() {
      this.context.unregisterElementViewForPath(this, this.props.element._keyPath);
    }

    forceRefreshElement() {
      const cursor = this.context.store.getState().getIn(this.props.element._keyPath);
      this.setState(state => ({element: cursor}));
    }


    render() {
      // if (isSubclassOf(Componenet, React.Component)) {
      //   return <Component element={this.props.element} dispatch={this.dispatch} />;
      // } else {
      //   return Component({element, dispatch});
      // }

      return <Component key="elementImpl" element={this.state.element} dispatch={this.dispatch} />;

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
