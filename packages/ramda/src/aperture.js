'use strict';

import R from 'ramda';
import {Seq} from 'immutable';
import {isCollection} from './immutable/compat';

export default R.curryN(2, function aperture(n, list) {
  if (isCollection(list)) {
    return Seq(portions(n, list));
  }

  return R.aperture(list);
});

function* portions(n, list) {
  let current, remaining = list;

  while (remaining !== null) {
    current = remaining.take(n);
    if (current.count() === n) {
      yield current;
      remaining = remaining.skip(n);
    } else {
      remaining = null;
    }
  }
}
