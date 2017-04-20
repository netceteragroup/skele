'use strict';

import R from 'ramda';
import {List} from 'immutable';
import {isIndexed} from './immutable/compat';

export default R.curryN(2, function ap(applicative, fn) {
  if (isIndexed(fn) &&
      (typeof applicative.ap !== 'function') &&
      (typeof applicative !== 'function')) {
    let apl = List(applicative);

    return apl.reduce((acc, f) => acc.concat(fn.map(f)), List());
  }

  return R.ap(applicative, fn);
});
