'use strict';

import R from 'ramda';
import {isIndexed} from './immutable/compat';

export default R.curryN(2, function all(fn, list) {
  if (isIndexed(list)) {
    return list.every(fn);
  } else {
    return R.all(fn, list);
  }
});
