'use strict'

import * as Subsystem from './subsystem'
import * as Kernel from './kernel'

import core, { defaultSubsystems } from './core'
import * as data from './data'
import * as zip from './zip'
import * as action from './action'
import * as registry from './registry'
import * as propNames from './propNames'
import * as http from './read/http'

// various action Types
import * as readActions from './read/actions'

import { Engine, EntryPoint } from './engine'

let { ui, read, effect, update, transform, enrich } = core

let actions = {
  types: {
    read: readActions.types,
  },
  read: readActions.read,
  readRefresh: readActions.readRefresh,
  ...action,
}

export {
  ui,
  read,
  effect,
  update,
  transform,
  enrich,
  data,
  zip,
  actions,
  Engine,
  EntryPoint,
  Kernel,
  Subsystem,
  defaultSubsystems,
  registry,
  propNames,
  http,
}
export default {
  ...core,
  data,
  zip,
  actions,
  Engine,
  EntryPoint,
  Kernel,
  Subsystem,
  defaultSubsystems,
  registry,
  propNames,
  http,
}
