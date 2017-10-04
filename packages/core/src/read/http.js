/* @flow */
'use strict'
import { fromJS } from 'immutable'

export function httpRead(
  url: string,
  revalidate: boolean
): Promise<ReadResponse> {
  const options = {}
  if (revalidate) {
    const headers = {
      'Cache-Control': 'max-age=0',
    }
    options['headers'] = headers
  }
  return fetch(url, options)
    .then(processResponse)
    .catch(errorResponseForUrl(url))
}

function processResponse(resp: Object): ReadResponse | Promise<ReadResponse> {
  if (resp.ok) {
    return resp
      .json()
      .then(json => ({ value: fromJS(json), meta: responseMeta(resp) }))
      .catch(errorResponseForUrl(resp.url))
  } else {
    return { meta: responseMeta(resp) }
  }
}

function errorResponseForUrl(url): ErrorFn {
  return error => ({
    meta: {
      url,
      status: 420,
      message: error,
    },
  })
}

export function responseMeta(resp: Object): Meta {
  let message = resp.statusText
  if (!message) {
    message = resp.ok ? 'OK' : 'NOK'
  }
  return {
    url: resp.url,
    status: resp.status ? resp.status : 200,
    message: message,
  }
}
