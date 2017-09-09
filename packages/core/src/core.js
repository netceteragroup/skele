'use strict'

import * as SubSystem from './subsystem'
import './transform'
import './read'

const core = SubSystem.create(() => ({
  name: 'core',
}))

// export the list of default subsystems

// default stuff

core.read.register(core.read.default, core.read.httpRead)

export default core
