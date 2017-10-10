'use strict'

export const types = {
  read: '@@girders-elements/actions.read',
  readRefresh: '@@girders-elements/actions.read.refresh',
  setRefreshing: '@@girders-elements/actions.read.setRefreshing',
  setLoading: '@@girders-elements/actions.read.setLoading',
  apply: '@@girders-elements/actions.read.apply',
  fail: '@@girders-elements/actions.read.fail',
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

export function readRefresh() {
  return {
    type: types.readRefresh,
  }
}
