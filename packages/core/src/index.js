'use strict';

import * as _ui from './ui';
import read from './read';
import * as data from './data';

import update from './update';
import Engine from './engine/engine';

const ui = {
  register: _ui.register,
  reset: _ui.reset,
  forElement: _ui.forElement,
  forElements: _ui.forElements
};

export {
  ui,
  read,
  update,
  data,
  Engine
}

export default {
  ui,
  read,
  update,
  data,
  Engine
}
