'use strict'

import * as Subsystem from './subsystem'
import * as Kernel from './kernel'

import core, { defaultSubsystems } from './core'
import * as data from './data'
import * as zip from './zip'
import * as actions from './action'
import * as registry from './registry'
import * as propNames from './propNames'

import { Engine, EntryPoint } from './Engine'

let { ui, read, update, transform } = core

export {
  ui,
  read,
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
}
