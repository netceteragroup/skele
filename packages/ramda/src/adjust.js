'use strict';

export default function adjust(fn, idx, list) {
  const len = list.count();
  if (idx >= len || idx < -len) {
    return list;
  } else {
    const pos = idx < 0 ? len + idx : idx;
    return list.map((v, i) => i === pos ? fn(v) : v);
  }
}
