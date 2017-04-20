'use strict';

import R from 'ramda';

export const dispatch2 = R.curryN(5, function(predicate, original, prop, arg, coll) {
  if (predicate(coll)) {
    return coll[prop].call(coll, arg);
  }
  return R[original](arg, coll);
});

export const dispatch3 = R.curryN(6, function(predicate, original, prop, arg1, arg2, coll) {
  if (predicate(coll)) {
    return coll[prop].call(coll, arg1, arg2);
  }
  return R[original](arg1, arg2, coll)
});
