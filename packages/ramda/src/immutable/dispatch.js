'use strict';

import R from 'ramda';

export const dispatch2 = R.curryN(5, function(predicate, original, prop, arg, coll) {
  if (predicate(coll)) {
    return coll[prop].call(coll, arg);
  }
  return R[original](arg, coll);
});
