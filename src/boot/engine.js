'use strict';

import React from 'react';
import { compose, createStore, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { isOfKind } from '../common/element';

import * as ui from '../ui';
import { reducer } from '../update';

import Boot from './ui/boot';

import { watchReadPerform } from '../read/reducer';

const sagaMiddleware = createSagaMiddleware();

const buildStore = (initialAppState) => {
  const storeFactory = compose(
    applyMiddleware(sagaMiddleware)
  )(createStore);

  return storeFactory(reducer, initialAppState);
};


const buildView = rootElement => store => () => {
  const mapStateToProps = appState => ({ element: appState });
  const ConnectedView = connect(mapStateToProps)(rootElement);

  return (
    <Provider store={store}>
      <ConnectedView />
    </Provider>
  );
};

const defaultAppState = fromJS({ ui: { kind: ['__boot'] }});
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
  const view = buildView(initialRootElement)(buildStore(Cursor.from(initialAppState)));
  sagaMiddleware.run(watchReadPerform);
  return view;
}
