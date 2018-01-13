'use strict'

import R from 'ramda'
import invariant from 'invariant'
import { fromJS } from 'immutable'

import uuid from 'uuid'

import { info, error } from '../impl/log'
import { time, timeSync } from '../impl/util'

import { canonical, flow } from '../data'
import * as readActions from './actions'
import * as propNames from '../propNames'
import { isOK, isResponse } from './http'

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
const setRefreshMeta = R.curry((meta, el) =>
  el
    .setIn([propNames.metadata, 'failedRefresh'], meta)
    .deleteIn([propNames.metadata, 'refreshing'])
)

export function setLoading(element, action) {
  const { readId } = action
  return flow(
    element,
    updateKind(k => k.set(0, '__loading')),
    setReadId(readId)
  )
}

export function setRefreshing(element, action) {
  let { readId, refreshing } = action
  if (refreshing == null) refreshing = true

  return flow(element, setReadId(readId), setRefreshingAttr(refreshing))
}

export function setRefreshMetadata(element, action) {
  let { metadata, readId } = action

  return flow(
    element,
    R.unless(
      el => el == null || readId !== getReadId(el),
      setRefreshMeta(metadata)
    )
  )
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
    setMeta(fromJS(response.meta))
  )
}

export async function performRead(context, readParams) {
  const {
    registry,
    enrichment,
    enhancement,
    transformation,
  } = context.subsystems.read.context

  const kernel = context
  const initialValue = kernel.query()

  const { uri, opts } = readParams
  const reader = registry.get(uri) || registry.get(fallback)

  if (reader != null) {
    let enhanceContext = {
      config: kernel.config,
      subsystems: kernel.subsystems,
      subsystemSequence: kernel.subsystemSequence,
      elementZipper: kernel.elementZipper,
    }

    const [readResponse, contextBasedEnhancements] = await Promise.all([
      time(`TIME-reader-(${uri})`, reader)(
        uri,
        opts,
        R.pick(['config', 'subsystems', 'subsystemSequence'], context)
      ),
      time(
        `TIME-enhancement-context-based-(${uri})`,
        enhancement.extractUpdates
      )(initialValue, enhanceContext, {
        minNumberOfArgs: 0,
        maxNumberOfArgs: 1,
      }),
    ])

    if (!isResponse(readResponse)) {
      throw new Error(
        `The read fn acting on ${uri} has returned an invalid response: ${readResponse}`
      )
    }
    if (isOK(readResponse)) {
      const readValue = fromJS(readResponse.value).merge({
        [propNames.metadata]: fromJS(readResponse.meta || defaultMeta(uri)),
      })

      enhanceContext = {
        ...enhanceContext,
        readValue,
      }

      const elementBasedEnhancements = await time(`TIME-enhancement-element-based-(${uri})`, enhancement.extractUpdates)(readValue, enhanceContext, {
        minNumberOfArgs: 2,
        maxNumberOfArgs: 2,
      })

      const enhancedResponse = await time(
        `TIME-enhancement-(${uri})`,
        enhancement.executeUpdates
      )(readValue, contextBasedEnhancements, elementBasedEnhancements)

      const enrichContext = {
        ...enhanceContext,
        readValue: enhancedResponse,
      }

      const enrichedResponse = await time(
        `TIME-enrichment-(${uri})`,
        enrichment
      )(enhancedResponse, enrichContext)

      const transformContext = {
        ...enrichContext,
        readValue: enrichedResponse,
      }

      const transformedResponse = timeSync(`TIME-transformation-(${uri})`, transformation
        )(enrichedResponse,
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
        status: 999,
        message: `There's no reader defined for ${pattern}. Did you forget to register a fallback reader?`,
      },
    }
  }
}

function defaultMeta(uri) {
  return {
    status: 200,
    uri,
    url: uri,
  }
}

export async function read(context, action) {
  const { dispatch } = context
  const readId = uuid()

  dispatch({ ...action, readId, type: readActions.types.setLoading })

  try {
    const readResponse = await time(
      `TIME-performRead-(${action.uri})`,
      performRead
    )(context, {
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
          status: 999,
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
      info(`Unsuccessful refreshing (read) ${uri} `, response)

      dispatch({
        ...action,
        readId,
        metadata: fromJS(response.meta),
        type: readActions.types.setRefreshMetadata,
      })
    }
  } catch (e) {
    error(`Error while refreshing (read) ${uri} `, e)

    dispatch({
      ...action,
      readId,
      metadata: fromJS({
        status: 999,
        message: e.toString(),
        error: e,
      }),
      type: readActions.types.setRefreshMetadata,
    })
  }
}
