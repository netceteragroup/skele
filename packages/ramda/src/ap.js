'use strict';

import {List} from 'immutable';

export default function ap(applicative, fn) {
  let apl = List(applicative);

  return apl.reduce((acc, f) => acc.concat(fn.map(f)), List());
}
