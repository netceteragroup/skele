'use strict'

import I from 'immutable'
import Cursor from 'immutable/contrib/cursor'
import R from 'ramda'

import * as zip from './zip'
import * as actions from './action'
import * as data from './data'

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
    this._init = Cursor.from(I.fromJS(init || {}))

    // booting

    // 1. create the initial subsystem map, so extensons are available
    //    for instantation
    const ssMap = R.reduce((ss, s) => R.assoc(s.name, s, ss), {}, subsystems)
    this._subsystems = ssMap
    this._subsystemSequence = subsystems

    // 2. create actual subsystems, providing the initial map for extension
    //    lookup. Order is important here.
    let instantiatedSeq = []
    let instantatedMap = {}

    for (const s of subsystems) {
      const instantiated = SubSystem.instantiate(this, instantatedMap, s)
      instantiatedSeq.push(instantiated)
      instantatedMap[instantiated.name] = instantiated
    }

    // 3. put subsystems in place

    this._subsystems = instantatedMap

    this._subsystemSequence = instantiatedSeq

    // 4. The store

    const middleware = getMiddleware(this.subsystemSequence)
    const reducer = buildReducer(this.subsystemSequence)

    if (R.isEmpty(middleware)) {
      this._store = createStore(reducer, this._init)
    } else {
      this._store = createStore(
        reducer,
        this._init,
        applyMiddleware(...middleware)
      )
    }

    // 5. start the subsystems
    for (const s of this.subsystemSequence) {
      if (s.start) s.start()
    }
  }

  // subscribes to updates from the store
  subscribe(listener) {
    return this._store.subscribe(listener)
  }
  // dispatch an elements action
  dispatch(action) {
    this._store.dispatch(action)
  }

  // query the current state at a position
  query(path) {
    const p = data.asList(path)

    const root = Cursor.from(this._store.getState())
    const result = p.isEmpty() ? root : root.getIn(p)

    return result
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

  get elementZipper() {
    return zip.elementZipper({
      defaultChildPositions: getChildPostions(this.config),
    })
  }

  focusOn(path) {
    const self = this

    return {
      dispatch(action) {
        self.dispatch(actions.atCursor(self.query(path), action))
      },

      query(subPath) {
        return self.query(data.asList(path).concat(data.asList(subPath)))
      },

      focusOn(subPath) {
        return self.focusOn(data.asList(path).concat(data.asList(subPath)))
      },

      get config() {
        return self.config
      },

      get subsystems() {
        return self.subsystems
      },

      get subsystemSequence() {
        return self.subsystemSequence
      },

      get elementZipper() {
        return self.elementZipper
      },

      subscribe(listener) {
        return self.subscribe(listener)
      },
    }
  }
}

function buildReducer(subsystems) {
  const reducers = R.pipe(R.map(SubSystem.reducer), R.reject(R.isNil))(
    subsystems
  )

  return (state, action) => R.reduce((s, r) => r(s, action), state, reducers)
}

const getMiddleware = R.pipe(R.map(SubSystem.middleware), R.reject(R.isNil))

const getChildPostions = R.either(
  R.path(['data', 'defaultChildPositions']),
  R.path(['transform', 'childrenElements'])
)

export function create(subsystems, init, config) {
  return new Kernel(subsystems, init, config)
}

export default {
  create,
}
