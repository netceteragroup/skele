'use strict'

import * as SubSystem from './subsystem'
import * as Read from './read'

const coreSubSystem = SubSystem.create({
  name: 'core',
})

// export the list of default subsystems

// default stuff

coreSubSystem.read.register(Read.fallback, Read.httpRead)

export default coreSubSystem
