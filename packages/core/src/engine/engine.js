'use strict';

import React, {Component, Children} from 'react';
import { compose, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import R from 'ramda';

import * as ui from '../ui';
import { reducer } from '../update';

import { watchReadPerform } from '../read/reducer';

const sagaMiddleware = createSagaMiddleware();

const buildStore = (initialAppState, customMiddleware = [], config) => {
  const storeFactory = compose(
    applyMiddleware(sagaMiddleware, ...customMiddleware)
  )(createStore);
  const reducerCurry = R.curry(reducer);
  const reducerWithConfig = reducerCurry(config)
  return storeFactory(reducerWithConfig, initialAppState);
};

function toImmutable(initState) {
  return initState.get ? initState : fromJS(initState);
}

function createState(initState, customMiddleware, config = {}) {
  const immutableInitState = toImmutable(initState);
  const store = buildStore(Cursor.from(immutableInitState), customMiddleware, config);
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
    if (!this.props.children) {
      return null;
    }
    return Children.only(this.props.children);
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
    this.state = createState(props.initState, props.customMiddleware, props.config);
    sagaMiddleware.run(watchReadPerform);
    this.unsubscribe = this.state.store.subscribe(this._reRender.bind(this));
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillReceiveProps(nextProps) {
    const newState = toImmutable(nextProps.initState);
    if (!this.state.store.getState().equals(newState)) {
      this.setState(createState(newState, nextProps.customMiddleware));
    }
  }

  _reRender() {
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <ContextWrapper store={this.state.store}>
        { ui._for(this.state.store.getState()) }
      </ContextWrapper>
    );
  }
}

Engine.propTypes = {
  initState: React.PropTypes.object.isRequired,
  customMiddleware: React.PropTypes.arrayOf(React.PropTypes.func)
};
