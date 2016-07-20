'use strict';

import React from 'react';
import { compose, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { combineReducers } from 'redux-immutable';
import devTools from 'remote-redux-devtools';
import { fromJS } from 'immutable';
import reduxElmStoreEnhancer from 'redux-elm';

import rootUpdater from './rootUpdater';
import rootView from './rootView';

const identity = v => v;

const getDevTools = () => {
  if (process.env.NODE_ENV === 'development') {
    return devTools();
  } else {
    return identity;
  }
};

const buildStore = (reducer, initialAppState = fromJS({root: undefined})) => {
  const storeFactory = compose(
    reduxElmStoreEnhancer,
    getDevTools()
  )(createStore);

  return storeFactory(combineReducers({
    root: rootUpdater
  }), initialAppState);
};

const buildView = store => () => {
  const ConnectedView = connect(appState => ({ model: appState.get('root') }))(rootView);

  return (
    <Provider store={store}>
      <ConnectedView />
    </Provider>
  );
};

export default () => {
  const store = buildStore(combineReducers({
    root: rootUpdater
  }));
  return buildView(store);
}
