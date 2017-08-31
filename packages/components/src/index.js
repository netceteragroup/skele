'use strict'

import ViewportTracker from './viewport/tracker'
import ViewportAware from './viewport/aware'
import WithPlaceHolder from './viewport/withPlaceHolder'
import WithEvents from './shared/WithEvents'

const Viewport = {
  Tracker: ViewportTracker,
  Aware: ViewportAware,
  WithPlaceHolder: WithPlaceHolder,
}

const Mixins = {
  WithEvents,
}

export { Viewport, Mixins }

export default {
  Viewport,
  Mixins,
}
