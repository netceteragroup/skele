'use strict'

// a trie implementation with few specifics:
// - works with arrays instead of strings (arrays are keys)
// - has some value stored at terminating nodes
// - can perform exact lookups as well as "best matches", i.e. if
//   best match was asked for, it will return the value associated with the
//   closest ancestor
// - note, for keys - a single string is trates the same as an array with just
//   that string, i.e. 'a' <==> ['a']
// - it is meant to be fast, so the code style is a bit unwieldly

export default class Trie {
  // a node is an object, each own property corresponding to an entry towards the next node
  // two special properties are used:
  // - $$T to determine whether a "workd" ends at this node
  // - $$V the value stored at this node
  root = {
    $$T: false,
  }
  isEmpty = true

  register(key, obj) {
    this.isEmpty = false

    let current = this.root

    if (!Array.isArray(key)) {
      let n = current[key]
      if (n == null) {
        n = { $$T: false }
        current[key] = n
      }

      n.$$T = true
      n.$$V = obj

      return
    }

    for (let i = 0, len = key.length; i < len; i++) {
      const p = key[i]
      let n = current[p]
      if (n == null) {
        n = { $$T: false }
        current[p] = n
      }
      current = n
    }

    current.$$T = true
    current.$$V = obj
  }

  get(key, bestMatch = false) {
    let current = this.root
    let best = current.$$T ? current.$$V : undefined

    if (!Array.isArray(key)) {
      const n = current[key]

      if (n != null && n.$$T) {
        return n.$$V
      } else if (bestMatch) {
        return best
      }
      return undefined
    }

    for (let i = 0, len = key.length; i < len; i++) {
      const p = key[i]
      current = current[p]

      if (current == null) {
        return bestMatch ? best : undefined
      }

      if (current.$$T) best = current.$$V
    }

    if (current == null || !current.$$T) {
      return bestMatch ? best : undefined
    } else {
      return current.$$V
    }
  }

  getEntry(key, bestMatch = false) {
    let current = this.root
    let currentKey = []
    let best = current.$$T ? current.$$V : undefined
    let bestKey = current.$$T ? [] : undefined

    if (!Array.isArray(key)) {
      const n = current[key]

      if (n != null && n.$$T) {
        return { key: [key], value: n.$$V }
      } else if (bestMatch && best != null) {
        return { key: [], value: best }
      }
      return undefined
    }

    for (let i = 0, len = key.length; i < len; i++) {
      const p = key[i]
      current = current[p]
      currentKey.push(p)

      if (current == null) {
        return bestMatch && best != null
          ? { key: bestKey, value: best }
          : undefined
      }

      if (current.$$T) {
        best = current.$$V
        bestKey = currentKey.slice()
      }
    }

    if (current == null || !current.$$T) {
      return bestMatch && best != null
        ? { key: bestKey, value: best }
        : undefined
    } else {
      return { key: currentKey, value: current.$$V }
    }
  }

  collect(key) {
    let current = this.root
    let result = current.$$T
      ? Array.isArray(current.$$V)
        ? current.$$V
        : [current.$$V]
      : []

    key = Array.isArray(key) ? key : [key]

    for (let i = 0, len = key.length; i < len; i++) {
      const p = key[i]
      current = current[p]

      if (current == null) break

      if (current.$$T) {
        const v = current.$$V
        if (Array.isArray(v)) {
          Array.prototype.push.apply(result, v)
        } else {
          result.push(v)
        }
      }
    }

    return result
  }

  *collector(key) {
    let current = this.root
    let currentKey = []

    if (current.$$T) {
      yield {
        key: currentKey,
        value: current.$$V,
      }
    }

    key = Array.isArray(key) ? key : [key]

    for (let i = 0, len = key.length; i < len; i++) {
      const p = key[i]
      current = current[p]
      currentKey.push(p)

      if (current == null) break

      if (current.$$T) {
        yield {
          key: currentKey,
          value: current.$$V,
        }
      }
    }
  }
}
