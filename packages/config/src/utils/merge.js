import * as R from 'ramda'

export default function deepMerge(a = {}, b = {}) {
  return R.is(Array, b) && !R.is(Object, b[0])
    ? b
    : R.is(Object, a) && R.is(Object, b)
      ? R.mergeWith(deepMerge, a, b)
      : b
}
