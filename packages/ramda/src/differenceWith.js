'use strict';

import R from 'ramda';
import {Set} from 'immutable';
import {isCollection} from './immutable/compat';

export default R.curryN(3, function differenceWith(pred, first, second) {
  if (isCollection(first) || isCollection(second)) {
    const a = Set(first);
    const b = Set(second);
    return a.filterNot(x => b.some(R.partial(pred, [x])));
  }
  return R.differenceWith(pred, first, second);
});
