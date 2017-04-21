'use strict';

import R from 'ramda';
import {isIndexed} from './immutable/compat';

export default R.curryN(2, function dropRepeatsWith(pred, list) {
  if (isIndexed(list)) {
    const r = list.constructor().asMutable();

    if (list.count() > 0) {
      r.push(list.get(0));
    }
    list.skip(1).forEach(e => {
      if (!pred(r.last(), e)) r.push(e);
    });

    return r.asImmutable();
  }

  return R.dropRepeatsWith(pred, list);
});
