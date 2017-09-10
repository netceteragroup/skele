'use strict'

import * as SubSystem from './subsystem'
import transform from './transform'
import read from './read'
import update from './update'
import ui from './ui'

/**
 * This is the 'default' subsystem where all 'global' registrations go to
 */
const core = SubSystem.create(() => ({
  name: 'core',
}))

/**
 * The list of default subsystems
 */
export const defaultSubsystems = [transform, read, update, ui, core]
core.defaultSubsystems = defaultSubsystems

// export the list of default subsystems

// default registrations

core.read.register(core.read.default, core.read.httpRead)

export default core
