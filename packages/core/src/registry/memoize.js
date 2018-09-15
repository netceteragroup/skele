'use strict'

import Trie from './impl/Trie'
import { adaptKey } from './Registry'

// A specialized memoization function for single argument
// functions that take a registry key
// allows efficient cache storage for such keys
export default function memoize(fn) {
  let cache = new Trie()

  return function(key) {
    key = adaptKey(key)
    let val = cache.get(key)

    if (typeof val === 'undefined') {
      // note that we store nulls in the cache to avoid
      // expensive lookups of missing values
      val = fn(key)

      cache.register(key, val != null ? val : null) // force 'null' for missing stuff
    }

    return val != null ? val : undefined
  }
}
