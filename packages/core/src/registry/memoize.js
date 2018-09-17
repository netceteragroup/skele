'use strict'

import Trie from './impl/Trie'
import { adaptKey } from './Registry'

// A specialized memoization function for single argument
// functions that take a registry key
// allows efficient cache storage for such keys
export default function memoize(fn, keyExtractor = x => adaptKey(x)) {
  let cache = new Trie()

  return function(key) {
    const cacheKey = keyExtractor(key)
    let val = cache.get(cacheKey)

    // note that we store nulls in the cache to avoid
    // expensive lookups of missing values
    if (typeof val === 'undefined') {
      val = fn(key) // use arg as-is

      cache.register(cacheKey, val != null ? val : null) // force 'null' for missing stuff
    }

    return val != null ? val : undefined
  }
}
