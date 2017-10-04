'use strict'

import * as Subsystem from './subsystem'
import * as Kernel from './kernel'

import core, { defaultSubsystems } from './core'
import * as data from './data'
import * as zip from './zip'
import * as actions from './action'
import * as registry from './registry'
import * as propNames from './propNames'
import * as http from './read/http'

import { Engine, EntryPoint } from './engine'

let { ui, read, effect, update, transform } = core

export {
  ui,
  read,
  effect,
  update,
  transform,
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
