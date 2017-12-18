import { is, mergeWith } from 'ramda'

export default function deepMerge(a = {}, b = {}) {
  return is(Array, b) && !is(Object, b[0])
    ? b
    : is(Object, a) && is(Object, b) ? mergeWith(deepMerge, a, b) : b
}
