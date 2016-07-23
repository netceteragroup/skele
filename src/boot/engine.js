'use strict';

import React from 'react';
import { compose, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { combineReducers } from 'redux-immutable';
import devTools from 'remote-redux-devtools';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { isOfKind } from '../common/element';

import * as ui from '../ui';
import * as update from '../update';

import Boot from './ui/boot';


const identity = v => v;

const getDevTools = () => {
  if (process.env.NODE_ENV === 'development') {
    return devTools();
  } else {
    return identity;
  }
};

const buildStore = (initialAppState) => {
  const storeFactory = compose(
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


const buildView = rootElement => store => () => {
  var mapStateToProps = appState => ({ element: Cursor.from(appState, ['ui']) });
  const ConnectedView = connect(mapStateToProps)(rootElement);

  return (
    <Provider store={store}>
      <ConnectedView />
    </Provider>
  );
};

const defaultAppState = fromJS({ ui: { kind: ['__boot']}});
const defaultRootElement = ({ element }) => {
  if (isOfKind(['__boot'], element)) {
    return Boot;
  }
  return ui.forElement(element);
};

/**
 * Engine that manages the application state.
 *
 * @param initialAppState Optional application state. If not provided, a default will be used.
 * @param initialRootElement Optional root element. If not provided, a default will be used.
 */
export default (
  initialAppState = defaultAppState,
  initialRootElement = defaultRootElement
) => {
  return buildView(initialRootElement)(buildStore(initialAppState));
}
