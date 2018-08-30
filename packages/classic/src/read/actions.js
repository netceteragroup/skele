'use strict'

export const types = {
  read: '@@skele/actions.read',
  readRefresh: '@@skele/actions.read.refresh',
  setRefreshing: '@@skele/actions.read.setRefreshing',
  setRefreshMetadata: '@@skele/actions.read.setRefreshMetadata',
  setLoading: '@@skele/actions.read.setLoading',
  apply: '@@skele/actions.read.apply',
  fail: '@@skele/actions.read.fail',
}

/**
 * Creates a read action.
 *
 * @param { String } uri the URI to be read, or an ob
 * @param {*} opts read options that will be passed onto the reader.
 *    Currently, only `revalidate` is supported
 *   (which instructs the reader to perform revalidation of the content).
 *   If used in conjuction with the standard httpRead, one controls
 *   the http options eventually passed to `fetch` via this argument.
 *   Any extra properties are allowed. These may affect specific readers.
 *
 */
export function read(uri, opts = {}) {
  const defaults = {
    revalidate: false,
  }

  return {
    ...defaults,
    ...opts,
    uri,
    type: types.read,
  }
}

export function readRefresh(uri = undefined, opts = undefined) {
  const defaults = {
    revalidate: true,
  }

  let options = {}
  if (opts != null) {
    options = {
      ...defaults,
      ...opts,
    }
  }
  return {
    type: types.readRefresh,
    ...options,
    uri,
  }
}
