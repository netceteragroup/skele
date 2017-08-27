'use strict';

import ViewportTracker from './viewport/tracker';
import ViewportAware from './viewport/aware';
import WithPlaceholder from './viewport/withPlaceholder';
import WithListeners from './shared/withListeners';

const ViewportTrackerWithListeners = WithListeners(ViewportTracker);

const Viewport = {
  Tracker: ViewportTrackerWithListeners,
  Aware: ViewportAware,
  WithPlaceholder: WithPlaceholder,
};

export {
  Viewport,
};

export default {
  Viewport,
};