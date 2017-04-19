'use strict';

import R from 'ramda';
import {isIndexed} from './immutable/compat';

export default R.curryN(3, function adjust(fn, idx, list) {
  if (isIndexed(list)) {
    const len = list.count();
    if (idx >= len || idx < -len) {
      return list;
    } else {
      const pos = idx < 0 ? len + idx : idx;
      return list.map((v, i) => i === pos ? fn(v) : v);
    }
  } else {
    return R.adjust(fn, idx, list);
  }
});
