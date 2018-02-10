'use strict'

import * as R from 'ramda'
import { fromJS } from 'immutable'

export function execute(url, options) {
  const defaults = {
    revalidate: false,
    method: 'GET',
  }

  let opts
  if (typeof options === 'boolean') {
    opts = {
      ...defaults,
      revalidate: options,
    }
  } else {
    opts = {
      ...defaults,
      ...options,
    }
  }

  const headers = new Headers()
  if (opts.revalidate) {
    headers.append('Cache-Control', 'max-age=0')
  }
  if (opts.headers) {
    R.forEachObjIndexed((v, h) => headers.append(h, v), opts.headers)
  }

  const fetchOptions = { ...R.omit(['revalidate', 'headers'], opts), headers }
  return fetch(url, fetchOptions)
    .then(processFetchResponse)
    .catch(errorResponseForUrl(url))
}

export function post(url, json, options) {
  const opts = {
    ...options,
    method: 'POST',
    body: JSON.stringify(json),
    headers: {
      ...R.defaultTo({}, R.prop('headers', options)),
      'Content-Type': 'application/json',
    },
  }
  return execute(url, {
    ...opts,
    method: 'POST',
  })
}

export const get = execute
export const httpRead = get

function processFetchResponse(resp) {
  if (resp.ok) {
    return resp
      .json()
      .then(json => ({ value: fromJS(json), meta: responseMeta(resp) }))
      .catch(errorResponseForUrl(resp.url))
  } else {
    return { meta: responseMeta(resp) }
  }
}

function errorResponseForUrl(url) {
  return error => ({
    meta: {
      url,
      uri: url,
      status: 998,
      message: error != null ? error.message : undefined,
      error,
    },
  })
}

export function asResponse(value, from = undefined) {
  return {
    value,
    ...(from != null
      ? { meta: { status: 200, uri: from, url: from, message: 'OK' } }
      : {}),
  }
}

export function failedResponse(message, object = undefined, from = undefined) {
  if (from == null) {
    from = object
    object = undefined
  }

  return {
    ...(object != null ? { value: object } : {}),
    meta: {
      ...(from != null ? { uri: from, url: from } : {}),
      status: 999,
      message,
    },
  }
}

const unwrap = R.prop('value')
const wrap = (resp, v) => (isResponse(v) ? v : { ...resp, value: v })
/*
 * Like data.flow() but for responses; will unwrap before calling fn;
 * fn  can return just a value or a full blown response
 */
export function flow(resp, ...fns) {
  return R.reduce(
    (v, fn) => (isOK(v) ? wrap(v, fn(unwrap(v))) : R.reduced(v)),
    resp,
    fns
  )
}

export function responseMeta(resp) {
  let message = resp.statusText
  if (!message) {
    message = resp.ok || isOK(resp) ? 'OK' : 'Failure'
  }
  const uri = resp.uri || resp.url
  return {
    url: uri,
    uri,
    status: resp.status ? resp.status : 200,
    message: message,
  }
}

export function isResponse(response) {
  return (
    response != null &&
    (response.value != null || R.path(['meta', 'status'], response) != null)
  )
}

export function isOK(response) {
  const status = R.path(['meta', 'status'], response)

  return (
    (response.value != null && status == null) ||
    (response.value != null && status >= 200 && status < 400)
  )
}
