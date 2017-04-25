'use strict';

import {Map} from 'immutable';

export default function reduceBy(valueFn, init, keyFn, list) {
  return list.reduce(
    (acc, e) => acc.update(keyFn(e), v => valueFn(v != null ? v : init, e)),
    Map());
}
