'use strict';

import { List, fromJS } from 'immutable';

import { takeEvery } from 'redux-saga';
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
  const element = cursor.getIn(action.fromPath);
  if(!element) {
    // the path for the action can't be accessed in the latest cursor
    // cursor has changed, so we can only discard the action
    return cursor;
  }
  const canonicalKind = canonical(element.get('kind'));
  const pathToKind = List.of(...action.fromPath, 'kind');
  if (action.random) {
    const pathToRandom = List.of(...action.fromPath, 'random');
    if (action.random !== cursor.getIn(pathToRandom)) {
      // we have an obsolete mutation, discard
      return cursor;
    }
    // console.log('action-type-with-random: ', action.type);
    // console.log('random from action: ', action.random);
    // console.log('random from cursor: ', cursor.getIn(pathToRandom));
    // console.log('random equals: ', action.random === cursor.getIn(pathToRandom));
  }
  switch (action.type) {
    case 'READ': {
      const pathToRandom = List.of(...action.fromPath, 'random');
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__loading'))
        .setIn(pathToRandom, Math.random());
    }
    case 'READ_SUCCEEDED': {
      const kind = canonicalKind.size === 1 ? canonicalKind.set(0, '__container') : canonicalKind.rest();
      const pathToWhere = List.of(...action.fromPath, action.where);
      return cursor
        .setIn(pathToKind, kind)
        .setIn(pathToWhere, fromJS(action.value));
    }
    case 'READ_FAILED': {
      const pathToMeta = List.of(...action.fromPath, 'meta');
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__error'))
        .setIn(pathToMeta, fromJS(action.meta));
    }
    default: {
      return cursor;
    }
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
  yield* takeEvery('READ_PERFORM', readPerform)
}

