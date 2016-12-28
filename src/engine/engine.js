'use strict';

import React, {Component, Children} from 'react';
import { compose, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
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
    store: store,
    initState: immutableInitState
  };
}

class ContextWrapper extends Component {
  getChildContext() {
    return { store: this.store }
  }

  constructor(props, context) {
    super(props, context);
    this.store = props.store
  }

  render() {
    return Children.only(this.props.children)
  }
}

ContextWrapper.childContextTypes = {
  store: React.PropTypes.any
};

export default class Engine extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = createState(props.initState);

    this.updateComponentState = this.updateComponentState.bind(this);

    sagaMiddleware.run(watchReadPerform);
    this.state.store.subscribe(this.updateComponentState);
  }

  updateComponentState() {
    const store = this.state.store;
    const newState = toImmutable(store.getState());
    this.setState({initState: newState})
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.initState !== this.state.initState;
  }

  componentWillReceiveProps(nextProps) {
    const newState = toImmutable(nextProps.initState);
    if (!this.state.initState.equals(newState)) {
      this.setState(createState(newState));
    }
  }

  render() {
    return (
        <ContextWrapper store={this.state.store}>
          { ui.forElement(Cursor.from(this.state.initState)) }
        </ContextWrapper>
    );
  }
}

Engine.propTypes = {
  initState: React.PropTypes.object.isRequired
};
