'use strict';

import R from 'ramda';

import {isIndexed} from './immutable/compat';

export default R.curryN(2, function dropLastWhile(pred, list) {
  if (isIndexed(list)) {
    return list.withMutations(c => {
      while (pred(c.last())) c.butLast();
    });
  }
});
