/* @flow */
'use strict';

// register default read elements
import './elements/read';
import './elements/loading';
import './elements/error';
import './elements/container';

import { register, fallback, httpRead, responseMeta } from './readRegistry';

register(fallback, httpRead);

export {
  register,
  responseMeta
}

export default {
  register,
  responseMeta
}
