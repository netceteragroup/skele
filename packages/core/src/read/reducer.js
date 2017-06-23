'use strict';

import { List, fromJS } from 'immutable';

import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { apply } from '../transform'

import uuid from 'uuid';

import { canonical } from '../data/element';

import * as registry from './readRegistry';
import { ReadFn } from './readRegistry';

/**
 * Reducer function for Reads.
 *
 * @param config A configuration object passed from the Engine component
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export default function(config, cursor, action) {

  const childrenElements = config.childrenElements
  const element = cursor.getIn(action.fromPath);
  if(!element) {
    // the path for the action can't be accessed in the latest cursor
    // cursor has changed, so we can only discard the action
    return cursor;
  }
  const canonicalKind = canonical(element.get('kind'));
  const pathToKind = List.of(...action.fromPath, 'kind');
  if (action.readId) {
    const pathToReadId = List.of(...action.fromPath, 'readId');
    if (action.readId !== cursor.getIn(pathToReadId)) {
      // we have an obsolete mutation, discard
      return cursor;
    }
  }
  switch (action.type) {
    case 'READ': {
      const pathToReadId = List.of(...action.fromPath, 'readId');
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__loading'))
        .setIn(pathToReadId, uuid());
    }
    case 'READ_SUCCEEDED': {
      const kind = canonicalKind.size === 1 ? canonicalKind.set(0, '__container') : canonicalKind.rest();
      const pathToWhere = List.of(...action.fromPath, action.where);
      return cursor
        .setIn(pathToKind, kind)
        .setIn(pathToWhere, apply(fromJS(action.value), childrenElements));
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
  yield* takeEvery('READ_PERFORM', readPerform)
}

