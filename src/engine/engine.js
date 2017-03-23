'use strict';

import React, {Component, Children} from 'react';
import { compose, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fromJS, Map, Set, Seq, List, is } from 'immutable';
import Cursor from 'immutable/contrib/cursor';

import * as ui from '../ui';
import { reducer } from '../update';

import { watchReadPerform } from '../read/reducer';

const sagaMiddleware = createSagaMiddleware();

const buildStore = (initialAppState, customMiddleware) => {
  const storeFactory = compose(
    applyMiddleware(sagaMiddleware, ...customMiddleware)
  )(createStore);

  return storeFactory(reducer, initialAppState);
};

function toImmutable(initState) {
  return initState.get ? initState : fromJS(initState);
}

function createState(initState, customMiddleware) {
  const immutableInitState = toImmutable(initState);
  const store = buildStore(Cursor.from(immutableInitState), customMiddleware);
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
    this.state = createState(props.initState, props.customMiddleware);

    this._elementRegistry = Map();

    sagaMiddleware.run(watchReadPerform);
    this.unsubscribe = this.state.store.subscribe(this._reRender.bind(this));
  }

  getChildContext() {
    return {
      registerElementViewForPath: (view, keyPath) => {
        const p = fromJS(keyPath);
        let views = this._elementRegistry.get(p);
        if (views == null) {
          views = Set.of(view);
        } else {
          views = views.add(view);
        }

        this._elementRegistry = this._elementRegistry.set(p, views);
      },

      unregisterElementViewForPath: (view, keyPath) => {
        const p = fromJS(keyPath);
        let views = this._elementRegistry.get(p);
        if (views == null) {
          return;
        } else {
          views = views.remove(view);
        }

        this._elementRegistry = this._elementRegistry.set(p, views);

      }
    }


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
    const state = this.state.store.getState();
    let keyPath = state.get('LAST_KEY_PATH');
    let lastKind = state.get('LAST_KIND');


    if (keyPath) {
      keyPath = fromJS(keyPath);

      if (keyPath.count() == 0) {
        console.log('Forcing a full forceUpdate()');
        this.forceUpdate();
        return;
      }

      let el = state.getIn(keyPath);

      if (!is(el.get('kind'), lastKind)) {
        el = parentElement(el);
      }
      const kp = fromJS(el._keyPath);

      const views = this._elementRegistry.get(kp);


      if (views != null) {
        console.log('will do forceRefreshElement for el:', el.get('kind').toJS());

        views.forEach(v => {
          v.forceRefreshElement();
        });
      } else {
        // this.forceUpdate();
      }
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
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
  initState: React.PropTypes.object.isRequired,
  customMiddleware: React.PropTypes.arrayOf(React.PropTypes.func)
};

Engine.childContextTypes = {
  registerElementViewForPath: React.PropTypes.func,
  unregisterElementViewForPath: React.PropTypes.func
};



/**
 * Gets the parent value of this cursor. returns null if this is the root cursors.
 */
function parent(cursor: any): any {
  if (cursor == null) {
    return null;
  }

  const root = cursor._rootData;
  const onChange = cursor._onChange;
  const keyPath = cursor._keyPath;

  if (keyPath.length === 0) {
    return null; // root
  }

  const newPath = keyPath.slice(0, -1);

  return Cursor.from(root, newPath, onChange);
}

/**
 * Gets a Seq of all the parents (self first, then parent, ...) of this cursor. The Seq is lazy.
 */
function parents(cursor: any): Seq {
  if (cursor == null) {
    return List();
  }

  const self = cursor;

  function* _ancestors() {
    let current = self;

    while (current != null) {
      current = parent(current);

      if (current != null) {
        yield current;
      }
    }
  }

  return Seq(_ancestors());
}

function parentElement(cursor) {
  return parents(cursor).find(p => p.has('kind'));
}
