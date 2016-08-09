'use strict';

import { List, fromJS } from 'immutable';

import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import merge from 'lodash/merge';

import { canonical } from '../common/element';
import {
  Meta,
  ReadResponse,
  SuccessfulResponse,
  FailureResponse,
  ErrorFn
} from './types';

/**
 * Reducer function for Reads.
 *
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export default function(cursor, action) {
  console.log('read reducer');

  switch (action.type) {
    case 'READ':
      const canonicalKind = canonical(cursor.getIn(action.fromPath).get('kind'));
      const kindPath = List.of(...action.fromPath, 'kind');
      return cursor.setIn(kindPath, canonicalKind.set(0, '__loading').toJS());
    //case 'READ_LOAD':
    //  console.log('action', action);
    //  break;
    case 'READ_SUCCEEDED':
      console.log('read success');
      return cursor;
    case 'READ_FAILED':
      console.log('read failure');
      return cursor;
    default:
      return cursor;
  }

  return cursor;
}

function* readLoad(action) {
  console.log('readLoad: action', action);
  const readResponse = yield call(httpRead, 'https://json.blick.ch/sport/');
  console.log('readResponse',readResponse);
  if (readResponse.value) {
    yield put({...action, type: 'READ_SUCCEEDED', value: readResponse.value});
  } else {
    yield put({...action, type: 'READ_FAILED'})
  }
}

export function* watchReadLoad() {
  console.log('watchReadLoad');
  yield* takeLatest('READ_LOAD', readLoad)
}

function httpRead(url: string): ReadResponse {
  return fetch(url)
    .then(processResponse)
    .catch(errorResponseForUrl(url));
}

function processResponse(resp: Object): ReadResponse {
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

function responseMeta(resp: Object): Meta {
  const {url, status, statusMessage: message} = merge({status: 200, statusMessage: "OK"}, resp);

  return {
    url,
    status,
    message
  };
}
