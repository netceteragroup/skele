'use strict';

import R from 'ramda';
import {isIndexed} from './immutable/compat';
import {List} from 'immutable';

export default R.curryN(2, function concat(a, b) {
  if (isIndexed(a) || isIndexed(b)) return List(a).concat(List(b));
  return R.concat(a, b);
});
