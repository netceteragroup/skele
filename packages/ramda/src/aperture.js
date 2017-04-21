'use strict';

import {Seq} from 'immutable';

export default function aperture(n, list) {
  return Seq(portions(n, list));
}

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
