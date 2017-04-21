'use strict';

import R from 'ramda';
import {Set} from 'immutable';
import {isCollection} from './immutable/compat';

export default R.curryN(2, function difference(a, b) {
  if (isCollection(a) || isCollection(b)) return Set(a).subtract(Set(b));
  return R.difference(a, b);
});
