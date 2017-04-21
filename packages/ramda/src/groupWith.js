'use strict';

import {Seq} from 'immutable';

export default function groupWith(fn, list) {
  return Seq(groupWithG(fn, list));
}

function* groupWithG(fn, list) {
  let l = list;

  while (!l.isEmpty()) {
    const f = l.first();
    const run = l.rest().takeWhile(e => fn(f, e));

    yield run.unshift(f);

    l = l.skip(run.count() + 1);
  }
}
