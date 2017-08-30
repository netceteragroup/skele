/* @flow */
'use strict';

import { List, fromJS } from 'immutable';

import Registry from '../common/Registry';
import {
  Meta,
  ReadResponse,
  // SuccessfulResponse,
  // FailureResponse,
  ErrorFn,
  // RegKey,
  ReadDef,
  ReadFn
} from './types';

/**
 * symbol identifying the fallback read. Use it to register a fallback read
 *
 *     read.register(read.fallback, read.httpRead);
 *
 * @type {Symbol}
 */
export const fallback: Symbol = Symbol("fallback");

export const registry: Registry<ReadFn> = new Registry();

/**
 * Registers a read.
 */
export function register(pattern: ReadDef, read: ReadFn): void {
  let adapted: ReadFn = read;

  if (pattern instanceof RegExp) {
    const regexp = pattern;
    registry.register((u: List) => u.first().match(regexp) != null, adapted);
  } else {
    registry.register(pattern, adapted);
  }
}

export function get(pattern: ReadDef): ReadFn  {
  return registry.get(pattern);
}

export function httpRead(url: string, revalidate: boolean): Promise<ReadResponse> {
  const options = {};
  if (revalidate) {
    const headers = {
      'Cache-Control': 'max-age=0'
    };
    options['headers'] = headers;
  }
  return fetch(url, options)
    .then(processResponse)
    .catch(errorResponseForUrl(url));
}

function processResponse(resp: Object): ReadResponse | Promise<ReadResponse> {
  if (resp.ok) {
    return resp.json()
      .then(json => ({ value: fromJS(json), meta: responseMeta(resp)}))
      .catch(errorResponseForUrl(resp.url));
  } else {
    return { meta: responseMeta(resp) };
  }
}

function errorResponseForUrl(url): ErrorFn {
  return error => ({
    meta: {
      url,
      status: 420,
      message: error
    }
  });
}

export function responseMeta(resp: Object): Meta {
  let message = resp.statusText;
  if (!message) {
    message = resp.ok ? "OK" : "NOK";
  }
  return {
    url: resp.url,
    status: resp.status ? resp.status : 200,
    message: message
  };
}
