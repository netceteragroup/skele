'use strict';

import R from 'ramda';
import {isCollection} from './immutable/compat';

export default R.curryN(1, function clone(value) {
  if (isCollection(value)) return value;
  return R.clone(value);
});
