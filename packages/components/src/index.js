'use strict'

import ViewportTracker from './viewport/tracker'
import ViewportAware from './viewport/aware'
import WithPlaceholder from './viewport/withPlaceholder'
import WithEvents from './shared/withEvents'
i

const ViewportTrackerWithListeners = WithListeners(ViewportTracker)

const Viewport = {
  Tracker: ViewportTrackerWithListeners,
  Aware: ViewportAware,
  WithPlaceholder: WithPlaceholder,
}

const Mixins = {
  WithEvents,
}

export { Viewport, Mixins }

export default {
  Viewport,
  Mixins,
}
