'use strict';

import React from 'react';
import { compose, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import devTools from 'remote-redux-devtools';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import { isOfKind } from '../common/element';

import * as ui from '../ui';
import { reducer } from '../update';

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
  return buildView(initialRootElement)(buildStore(Cursor.from(initialAppState)));
}
