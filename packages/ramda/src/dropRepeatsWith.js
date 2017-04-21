'use strict';


export default function dropRepeatsWith(pred, list) {
  const r = list.constructor().asMutable();

  if (list.count() > 0) {
    r.push(list.get(0));
  }
  list.skip(1).forEach(e => {
    if (!pred(r.last(), e)) r.push(e);
  });

  return r.asImmutable();
}
