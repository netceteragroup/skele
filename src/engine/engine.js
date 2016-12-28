'use strict';

import React, {Component, Children} from 'react';
import { compose, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import * as ui from '../ui';
import { reducer } from '../update';

import { watchReadPerform } from '../read/reducer';

const sagaMiddleware = createSagaMiddleware();

const buildStore = (initialAppState) => {
  const storeFactory = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore);

  return storeFactory(reducer, initialAppState);
};

function toImmutable(initState) {
  return initState.get ? initState : fromJS(initState);
}

function createState(initState) {
  const immutableInitState = toImmutable(initState);
  const store = buildStore(Cursor.from(immutableInitState));
  return {
    store: store
  };
}

class ContextWrapper extends Component {
  getChildContext() {
    return { store: this.store }
  }

  constructor(props, context) {
    super(props, context);
    this.store = props.store;
  }

  render() {
    return Children.only(this.props.children)
  }
}

ContextWrapper.childContextTypes = {
  store: React.PropTypes.any
};

ContextWrapper.propTypes = {
  store: React.PropTypes.any.isRequired,
  children: React.PropTypes.any
};

export default class Engine extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = createState(props.initState);
    sagaMiddleware.run(watchReadPerform);
    this.state.store.subscribe(this._reRender.bind(this));
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillReceiveProps(nextProps) {
    const newState = toImmutable(nextProps.initState);
    if (!this.state.initState.equals(newState)) {
      this.setState(createState(newState));
    }
  }

  _reRender() {
    this.forceUpdate();
  }

  render() {
    return (
      <ContextWrapper store={this.state.store}>
        { ui.forElement(this.state.store.getState()) }
      </ContextWrapper>
    );
  }
}

Engine.propTypes = {
  initState: React.PropTypes.object.isRequired
};
