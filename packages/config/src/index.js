'use strict';

import * as _config from './config';

const config = {
  define: _config.define,
  init: _config.init
};

const activeConfiguration = _config.activeConfiguration

export {
  activeConfiguration as config
}

export default config

