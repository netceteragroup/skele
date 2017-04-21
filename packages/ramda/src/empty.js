'use strict';

import R from 'ramda';
import {isCollection} from './immutable/compat';
import {Seq} from 'immutable';

export default R.curryN(1, function empty(x) {
  if (Seq.isSeq(x)) return Seq();
  if (isCollection(x)) return x.constructor();
  return R.empty(x);
});
