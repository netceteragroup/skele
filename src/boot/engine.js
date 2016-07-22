'use strict';

import React from 'react';
import { compose, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { combineReducers } from 'redux-immutable';
import devTools from 'remote-redux-devtools';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import reduxElmStoreEnhancer from './storeEnhancer';

import * as ui from '../ui';
import * as update from '../update/updateRegistry';

import { ui as bookmarkUI, update as bookmarkUpdate } from './bookmark';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const identity = v => v;

const getDevTools = () => {
  if (process.env.NODE_ENV === 'development') {
    return devTools();
  } else {
    return identity;
  }
};

const buildStore = (initialAppState = fromJS({ui: {
  kind: ['__boot'],
  test: 'example value',
  toggle1: {
    kind: ['element', 'bookmark'],
    bookmarked: false
  },
  toggle2: {
    kind: ['element', 'bookmark'],
    bookmarked: false
  }
}})) => {
  const storeFactory = compose(
    reduxElmStoreEnhancer,
    getDevTools()
  )(createStore);

  return storeFactory(combineReducers({
    ui: (store, action) => {
      const theUpdate = update.forAction(action);
      const path = action.path;
      if (path && theUpdate) {
        const elementPath = path.splice(1);
        const element = store.getIn(elementPath);
        const updatedElement = theUpdate(element, action);
        return store.setIn(elementPath, theUpdate(element, action));
      }
      return store;
    }
  }), initialAppState);
};

const rootElement = ({ element, dispatch }) => {
  const Element = ui.forElement(element.get('toggle1'));
  return (
    <View style={{paddingTop: 20}}>
      <Text>Hello from Root View. Test: {element.get('test')}</Text>
      { ui.forElement(element.get('toggle1')) }
      { ui.forElement(element.get('toggle2')) }
    </View>
  )
};

const buildView = store => () => {
  var mapStateToProps = appState => ({ element: Cursor.from(appState, ['ui']) });
  const ConnectedView = connect(mapStateToProps)(rootElement);

  return (
    <Provider store={store}>
      <ConnectedView />
    </Provider>
  );
};

export default () => {
  return buildView(buildStore());
}
