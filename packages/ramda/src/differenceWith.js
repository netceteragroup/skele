'use strict';

import R from 'ramda';
import {Set} from 'immutable';

export default function differenceWith(pred, first, second) {
  const a = Set(first);
  const b = Set(second);
  return a.filterNot(x => b.some(R.partial(pred, [x])));
}
