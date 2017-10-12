'use strict'

import R from 'ramda'
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

  const fetchOptions = { ...opts, headers }
  return fetch(url, fetchOptions)
    .then(processFetchResponse)
    .catch(errorResponseForUrl(url))
}

export function post(url, json, options) {
  return execute(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(json),
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
    },
  })
}

export const get = execute
export const httpRead = get

function processFetchResponse(resp) {
  if (isxOk(resp)) {
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
      status: 420,
      message: error,
    },
  })
}

export function responseMeta(resp) {
  let message = resp.statusText
  if (!message) {
    message = isOK(resp) ? 'OK' : 'Failure'
  }
  const uri = resp.uri || resp.url
  return {
    url: uri,
    uri,
    status: resp.status ? resp.status : 200,
    message: message,
  }
}

export function isOK(response) {
  return (
    response.ok ||
    (response.meta && response.meta.status >= 200 && response.meta.status < 300)
  )
}
