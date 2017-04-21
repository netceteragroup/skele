'use strict';

export default function dropLastWhile(pred, list) {
  return list.withMutations(c => {
    while (pred(c.last())) c.butLast();
  });
}
