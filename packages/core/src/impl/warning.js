'use strict'

/* eslint-disable no-console */
export default function warning(msg) {
  if (typeof console !== undefined) {
    if (console.warn != null) {
      console.warn(msg)
    } else if (console.error != null) {
      console.error(msg)
    }
  }
}
/* eslint-enable no-console */
