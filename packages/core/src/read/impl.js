'use strict'

import R from 'ramda'
import { List, fromJS } from 'immutable'

import uuid from 'uuid'

import { kindOf, canonical, flow } from '../data'
import { actionMeta } from '../action'
import * as readActions from './actions'
import * as propNames from '../propNames'

export const fallback = '@@girders-elements/defaultRead'

const updateKind = R.curry((update, element) =>
  element.update('kind', R.pipe(canonical, update))
)
const setReadId = R.curry((id, el) =>
  el.setIn([propNames.metadata, 'readId'], id)
)
const getReadId = el => el.getIn([propNames.metadata, 'readId'])
const setMeta = R.curry((meta, el) => el.set(propNames.metadata, meta))

export function setLoading(element, action) {
  const { readId } = action
  return flow(
    element,
    updateKind(k => k.set(0, '__loading')),
    setReadId(readId)
  )
  return final
}

export function applyRead(element, action) {
  const { readId, readValue } = action

  if (element == null || readId !== getReadId(element)) return element

  return flow(readValue, setReadId(readId))
}

export function fail(element, action) {
  const { readId, readResponse } = action

  if (element != null || readId !== getReadId(element)) return element

  return flow(
    element,
    updateKind((k = k.set(0, '__error'))),
    setMeta(response.meta)
  )
}
export async function read(context, action) {
  const {
    registry,
    enrichment,
    transformation,
  } = context.subsystems.read.context
  const kernel = context
  const { dispatch } = kernel
  const readId = uuid()

  dispatch({ ...action, readId, type: readActions.types.setLoading })

  const { uri, revalidate } = action
  const reader = registry.get(uri) || registry.get(fallback)

  if (reader != null) {
    const readResponse = await reader(uri, revalidate)

    if (readResponse.value != null) {
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

      dispatch({
        ...action,
        type: readActions.types.apply,
        readId,
        response: { ...readResponse, value: transformedResponse },
        readValue: transformedResponse,
      })
    } else {
      dispatch({
        ...action,
        type: readActions.types.fail,
        response: readResponse,
      })
    }
  } else {
    dispatch({
      ...action,
      type: readActions.types.fail,
      response: {
        meta: {
          url: uri,
          uri,
          status: 420,
          message: `There's no reader defined for ${pattern}. Did you forget to register a fallback reader?`,
        },
      },
    })
  }
}
