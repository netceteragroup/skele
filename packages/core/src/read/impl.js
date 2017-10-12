'use strict'

import R from 'ramda'
import invariant from 'invariant'
import { fromJS } from 'immutable'

import uuid from 'uuid'

import { error } from '../impl/log'

import { canonical, flow } from '../data'
import * as readActions from './actions'
import * as propNames from '../propNames'
import { isOK } from './http'

export const fallback = '@@girders-elements/defaultRead'

const updateKind = R.curry((update, element) =>
  element.update('kind', R.pipe(canonical, update))
)
const setReadId = R.curry((id, el) =>
  el.setIn([propNames.metadata, 'readId'], id)
)
const getReadId = el => el.getIn([propNames.metadata, 'readId'])
const setMeta = R.curry((meta, el) => el.set(propNames.metadata, meta))
const setRefreshingAttr = R.curry((value, el) =>
  el.setIn([propNames.metadata, 'refreshing'], value)
)

export function setLoading(element, action) {
  const { readId } = action
  return flow(
    element,
    updateKind(k => k.set(0, '__loading')),
    setReadId(readId)
  )
  return final
}

export function setRefreshing(element, action) {
  let { readId, refreshing } = action
  if (refreshing == null) refreshing = true

  return flow(element, setReadId(readId), setRefreshingAttr(refreshing))
}

export function applyRead(element, action) {
  const { readId, readValue } = action

  if (element == null || readId !== getReadId(element)) return element

  return flow(readValue, setReadId(readId))
}

export function fail(element, action) {
  const { readId, response } = action

  if (element == null || readId !== getReadId(element)) return element

  return flow(
    element,
    updateKind(k => k.set(0, '__error')),
    setMeta(response.meta)
  )
}

async function performRead(context, readParams) {
  const {
    registry,
    enrichment,
    transformation,
  } = context.subsystems.read.context
  const kernel = context

  const { uri, opts } = readParams
  const reader = registry.get(uri) || registry.get(fallback)

  if (reader != null) {
    const readResponse = await reader(uri, opts)

    if (isOK(readResponse)) {
      const readValue = fromJS(readResponse.value).merge({
        [propNames.metadata]: readResponse.meta,
      })

      const enrichContext = {
        readValue,
        config: kernel.config,
        subsystems: kernel.subsystems,
        subsystemSequence: kernel.subsystemSequence,
      }

      const enrichedResponse = await enrichment(readValue, enrichContext)

      const transformContext = {
        ...enrichContext,
        readValue: enrichedResponse,
      }

      const transformedResponse = transformation(
        enrichedResponse,
        transformContext
      )

      return { ...readResponse, value: transformedResponse }
    } else {
      return readResponse
    }
  } else {
    return {
      meta: {
        url: uri,
        uri,
        status: 420,
        message: `There's no reader defined for ${pattern}. Did you forget to register a fallback reader?`,
      },
    }
  }
}

export async function read(context, action) {
  const { dispatch } = context
  const readId = uuid()

  dispatch({ ...action, readId, type: readActions.types.setLoading })

  try {
    const readResponse = await performRead(context, {
      uri: action.uri,
      opts: R.pick(['revalidate'], action),
    })

    if (isOK(readResponse)) {
      dispatch({
        ...action,
        type: readActions.types.apply,
        readId,
        response: readResponse,
        readValue: readResponse.value,
      })
    } else {
      dispatch({
        ...action,
        readId,
        type: readActions.types.fail,
        response: readResponse,
      })
    }
  } catch (e) {
    dispatch({
      ...action,
      readId,
      type: readActions.types.fail,
      response: {
        meta: {
          status: 420,
          message: e.toString(),
          error: e,
        },
      },
    })
  }
}

export async function readRefresh(context, action) {
  const { dispatch } = context
  const element = context.query()
  const uri = action.uri || element.getIn([propNames.metadata, 'uri'])
  const readId = uuid()

  invariant(
    uri != null,
    'The element you are refreshing must have been loaded via a read'
  )

  context.dispatch({
    ...action,
    readId,
    type: readActions.types.setRefreshing,
  })

  try {
    const response = await performRead(context, {
      uri: uri,
      opts: { ...{ revalidate: true }, ...R.pick(['revalidate'], action) },
    })

    if (isOK(response)) {
      dispatch({
        ...action,
        readId,
        type: readActions.types.apply,
        response,
        readValue: response.value,
      })
    } else {
      error(`Error while refreshing (read) ${uri} `, response)

      dispatch({
        ...action,
        readId,
        type: readActions.types.setRefreshing,
        refreshing: false,
      })
    }
  } catch (e) {
    error(`Error while refreshing (read) ${uri} `, e)

    dispatch({
      ...action,
      readId,
      type: readActions.types.setRefreshing,
      refreshing: false,
    })
  }
}
