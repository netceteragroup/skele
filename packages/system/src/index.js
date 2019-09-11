'use strict'

import {
  props as propNames,
  order,
  ext,
  modify,
  using,
  set,
  named,
} from './extensions'
import System, { query, queryExts } from './system'
import { runtime, start, stop, slots as runtimeSlots } from './runtime'
import Unit from './unit'

const slots = {
  /**
   * The runtime extension slot.
   */
  runtime: runtimeSlots.runtime,
}

export {
  System,
  Unit,
  slots,
  query,
  queryExts,
  start,
  stop,
  propNames,
  order,
  ext,
  named,
  modify,
  set,
  using,
  runtime,
}

export default System
