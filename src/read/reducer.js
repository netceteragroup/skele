'use strict';

import { List, fromJS } from 'immutable';

import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { canonical } from '../common/element';

import * as registry from './readRegistry';
import { ReadFn } from './readRegistry';

/**
 * Reducer function for Reads.
 *
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export default function(cursor, action) {
  // console.log('read action', action);
  const canonicalKind = canonical(cursor.getIn(action.fromPath).get('kind'));
  const pathToKind = List.of(...action.fromPath, 'kind');
  switch (action.type) {
    case 'READ':
      return cursor.setIn(pathToKind, canonicalKind.set(0, '__loading'));
    case 'READ_SUCCEEDED':
      const kind = canonicalKind.size === 1 ? canonicalKind.set(0, '__container') : canonicalKind.rest();
      const pathToWhere = List.of(...action.fromPath, action.where);
      return cursor
        .setIn(pathToKind, kind)
        .setIn(pathToWhere, fromJS(action.value));
    case 'READ_FAILED':
      const pathToMeta = List.of(...action.fromPath, 'meta');
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__error'))
        .setIn(pathToMeta, fromJS(action.meta));
    default:
      return cursor;
  }
}

function* readPerform(action) {
  const pattern = action.uri;
  const reader: ?ReadFn = registry.get(pattern) || registry.get(registry.fallback);

  if (reader != null) {
    const readResponse = yield call(reader, pattern);
    if (readResponse.value) {
      yield put({...action, type: 'READ_SUCCEEDED', value: readResponse.value});
    } else {
      yield put({...action, type: 'READ_FAILED', meta: readResponse.meta})
    }
  } else {
    yield put({...action, type: 'READ_FAILED',
      meta: {
        url: pattern,
        status: 420,
        message: `There's no reader defined for ${pattern}. Did you forget to register a fallback reader?`
      }
    });
  }

}

export function* watchReadPerform() {
  // TODO andon: we need to have an ID for each saga execution. Identifying by element path can lead to errors.
  // move to takeEvery
  yield* takeLatest('READ_PERFORM', readPerform)
}

