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
  constructor(subsystems, init, config) {
    this._config = config
    this._init = I.fromJS(init)

    // booting

    // 1. create the initial subsystem map, so extensons are available
    //    for instantation
    const ssMap = R.reduce((ss, s) => R.assoc(s.name, s, ss), {}, subsystems)
    this._subsystems = ssMap
    this._subsystemSequence = subsystems

    // 2. create actual subsystems, providing the initial map for extension
    //    lookup. Order is important here.
    const instantiatedSeq = R.map(SubSystem.instantiate(this), subsystems)

    // 3. put subsystems in place

    this._subsystems = R.reduce(
      (ss, s) => R.assoc(s.name, s, ss),
      {},
      instantiatedSeq
    )

    this._subsystemSequence = instantiatedSeq

    // 4. The store

    const middleware = getMiddleware(this.subsystemSequence)

    if (R.isEmpty(middleware)) {
      this._store = createStore(
        buildReducer(this.subsystemSequence),
        this._init
      )
    } else {
      this._store = createStore(
        buildReducer(this.subsystemSequence),
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
  return R.reduce(R.pipe, R.identity, R.map(SubSystem.reducer, subsystems))
}

const getMiddleware = R.pipe(R.map(SubSystem.middleware), R.reject(R.isNil))

export function create(subsystems, init, config) {
  return new Kernel(subsystems, init, config)
}

export default {
  create,
}
