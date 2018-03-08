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

export function read(uri, opts) {
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

export function readRefresh(uri = undefined) {
  return {
    type: types.readRefresh,
    uri,
  }
}
