'use strict'

import I from 'immutable'
import Cursor from 'immutable/contrib/cursor'
import R from 'ramda'

import { createStore, applyMiddleware } from 'redux'

// import invariant from './impl'

import * as SubSystem from './subsystem'

// what's a kernel
// -- store
// -- dispatch at
// -- registered subsystenms

class Kernel {
  constructor(config, subsystems, init) {
    this._config = config
    this._init = I.fromJS(init)

    // booting

    // 1. create the initial subsystem map, so extensons are available
    //    for instantation
    const ssMap = R.reduce((ss, s) => R.assoc(s.name, s, ss), {}, subsystems)
    this._subsystems = ssMap

    // 2. create actual subsystems, providing the initial map for extension
    //    lookup. Order is important here.
    const subsystemsSeq = R.map(SubSystem.instantiate(this), subsystems)

    // 3. put subsystems in place

    this._subsystems = R.reduce(
      (ss, s) => R.assoc(s.name, s, ss),
      {},
      subsystemsSeq
    )

    this._subsystemSequence = subsystemsSeq

    // 4. The store

    const middleware = getMiddleware(subsystemsSeq)

    if (R.isEmpty(middleware)) {
      this._store = createStore(buildReducer(subsystemsSeq), this._init)
    } else {
      this._store = createStore(
        buildReducer(subsystemsSeq),
        this._init,
        applyMiddleware(...middleware)
      )
    }
  }

  // subscribes to updates from the store
  // dispatch an elements action
  dispatch() {}

  // query the current state at a position
  query(path) {
    return Cursor.from(this._store.getState()).getIn(path)
  }

  get subsystems() {
    return this._subsystems
  }

  get subsystemSequence() {
    return this._subsystemSequence
  }

  get config() {
    return this._config
  }
}

function buildReducer(subsystems) {
  return R.reduce(R.compose, R.identity, R.map(SubSystem.reducer, subsystems))
}

const getMiddleware = R.pipe(R.map(SubSystem.middleware), R.reject(R.isNil))

export function create(config, subsystems, init) {
  return new Kernel(config, subsystems, init)
}

export default {
  create,
}
