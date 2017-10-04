/** @flow */
'use strict'

import R from 'ramda'
import { List, fromJS } from 'immutable'

import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import uuid from 'uuid'

import { kindOf } from '../data'
import { actionMeta } from '../action'

export const fallback = '@@girders-elements/defaultRead'

/**
 * Reducer function for Reads.
 *
 * @param config A configuration object passed, currently holds a transformation
 *  function
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export const reducer = R.curry(function reducer(config, cursor, action) {
  if (!R.startsWith('READ', action.type)) return cursor

  const { transformation } = config
  const { keyPath: fromPath } = actionMeta(action)

  const element = cursor.getIn(fromPath)
  if (!element) {
    // the path for the action can't be accessed in the latest cursor
    // cursor has changed, so we can only discard the action
    return cursor
  }
  const canonicalKind = kindOf(element)
  const pathToKind = List.of(...fromPath, 'kind')

  if (action.readId) {
    if (action.readId !== element.get('readId')) {
      // we have an obsolete mutation, discard
      return cursor
    }
  }
  switch (action.type) {
    case 'READ_SET_LOADING': {
      const pathToReadId = List.of(...fromPath, 'readId')
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__loading'))
        .setIn(pathToReadId, uuid())
    }
    case 'READ_SUCCEEDED': {
      return cursor.setIn(
        fromPath,
        transformation(
          fromJS(action.response.value).merge({
            '@@girders-elements/metadata': action.response.meta,
          })
        )
      )
    }
    case 'READ_FAILED': {
      const pathToMeta = List.of(...fromPath, '@@girders-elements/metadata')
      return cursor
        .setIn(pathToKind, canonicalKind.set(0, '__error'))
        .setIn(pathToMeta, fromJS(action.response.meta))
    }
    default: {
      return cursor
    }
  }
})

function readSaga(config) {
  const { registry } = config

  return function*(action) {
    yield put({ ...action, type: 'READ_SET_LOADING' })

    const pattern = action.uri
    const revalidate = action.revalidate
    const reader: ?ReadFn = registry.get(pattern) || registry.get(fallback)
    if (reader != null) {
      const readResponse = yield call(reader, pattern, revalidate)
      if (readResponse.value) {
        yield put({ ...action, type: 'READ_SUCCEEDED', response: readResponse })
      } else {
        yield put({ ...action, type: 'READ_FAILED', response: readResponse })
      }
    } else {
      yield put({
        ...action,
        type: 'READ_FAILED',
        response: {
          meta: {
            url: pattern,
            status: 420,
            message: `There's no reader defined for ${pattern}. Did you forget to register a fallback reader?`,
          },
        },
      })
    }
  }
}

export function watchReadPerform(config) {
  return function* watchReadPerform() {
    yield* takeEvery('READ', readSaga(config))
  }
}
