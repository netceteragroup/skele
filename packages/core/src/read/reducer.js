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

  const childrenElements = config.transform && config.transform.childrenElements
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
    case 'READ_SET_LOADING': {
      const pathToReadId = List.of(...action.fromPath, 'readId');
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__loading'))
        .setIn(pathToReadId, uuid());
    }
    case 'READ_SUCCEEDED': {
      return cursor.setIn(action.fromPath,
        apply(
          fromJS(action.response.value).merge({'@@girders-elements/metadata': action.response.meta}),
          childrenElements
        ).value());
    }
    case 'READ_FAILED': {
      const pathToMeta = List.of(...action.fromPath, 'meta');
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__error'))
        .setIn(pathToMeta, fromJS(action.response.meta));
    }
    default: {
      return cursor;
    }
  }
}

function* readSaga(action) {
  yield put({...action, type: 'READ_SET_LOADING'});

  const pattern = action.uri;
  const revalidate = action.revalidate;
  const reader: ?ReadFn = registry.get(pattern) || registry.get(registry.fallback);
  if (reader != null) {
    const readResponse = yield call(reader, pattern, revalidate);
    if (readResponse.value) {
      yield put({...action, type: 'READ_SUCCEEDED', response: readResponse});
    } else {
      yield put({...action, type: 'READ_FAILED', response: readResponse})
    }
  } else {
    yield put({...action, type: 'READ_FAILED',
      reponse: {
        meta: {
          url: pattern,
          status: 420,
          message: `There's no reader defined for ${pattern}. Did you forget to register a fallback reader?`
        }
      }
    });
  }

}

export function* watchReadPerform() {
  yield* takeEvery('READ', readSaga)
}

