'use strict'

import * as R from 'ramda'
import invariant from 'invariant'
import { fromJS } from 'immutable'

import uuid from 'uuid'

import { data, log } from '@skele/core'

import { time, timeSync } from '../impl/util'

import * as readActions from './actions'
import * as propNames from '../propNames'
import { isOK, isResponse } from './http'

const { canonical, flow, kindOf } = data
const { info, error } = log

export const fallback = '@@skele/defaultRead'

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

export async function performRead(context, action) {
  const {
    registry,
    enrichment,
    enhancement,
    transformation,
  } = context.subsystems.read.context

  const kernel = context

  const { uri, ...opts } = R.omit(['type', propNames.actionMeta], action)

  const reader = registry.get(uri) || registry.get(fallback)

  if (reader != null) {
    let enhanceContext = {
      config: kernel.config,
      subsystems: kernel.subsystems,
      subsystemSequence: kernel.subsystemSequence,
      elementZipper: kernel.elementZipper,
      uri,
      opts,
    }

    const [readResponse, readIndependentEnhancements] = await time(
      `TIME-reader-plus-enhancement-(${uri})`,
      Promise.all.bind(Promise)
    )([
      time(`TIME-reader-(${uri})`, reader)(
        uri,
        opts,
        R.pick(['config', 'subsystems', 'subsystemSequence'], context)
      ),
      time(
        `TIME-enhancement-run-independent-(${uri})`,
        enhancement.runEnhancers
      )(null, enhanceContext, enhancement.readIndependentEnhancers()),
    ])

    if (!isResponse(readResponse)) {
      throw new Error(
        `The read fn acting on ${uri} has returned an invalid response: ${readResponse}`
      )
    }
    if (isOK(readResponse)) {
      const readValue = fromJS(readResponse.value).merge({
        [propNames.metadata]: fromJS(
          readResponse.meta || defaultMeta(uri)
        ).merge({ request: R.omit([propNames.actionMeta], action) }),
      })

      enhanceContext = {
        ...enhanceContext,
        readValue,
      }

      const readDependentEnhancements = await time(
        `TIME-enhancement-run-read-dependent-(${uri})`,
        enhancement.runEnhancers
      )(
        readValue,
        enhanceContext,
        enhancement.readDependentEnhancers(kindOf(readValue))
      )

      const enhancedResponse = timeSync(
        `TIME-enhancement-aply-(${uri})`,
        enhancement.applyEnhancements
      )(readValue, enhanceContext, [
        ...readIndependentEnhancements,
        ...readDependentEnhancements,
      ])

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

      const transformedResponse = timeSync(
        `TIME-transformation-(${uri})`,
        transformation
      )(enrichedResponse, transformContext)

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
        message: `There's no reader defined for ${uri}. Did you forget to register a fallback reader?`,
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
    )(context, action)

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
  const readId = uuid()

  let readAction
  if (action.uri != null) {
    readAction = action
  } else {
    readAction = element.getIn([propNames.metadata, 'request']).toJS()
  }

  invariant(
    readAction != null,
    'The element you are refreshing must have been loaded via a read, or you must provide an uri yourself.'
  )

  readAction.revalidate = flow(action, R.prop('revalidate'), R.defaultTo(true))

  context.dispatch({
    ...action,
    readId,
    type: readActions.types.setRefreshing,
  })

  try {
    const response = await performRead(context, readAction)

    if (isOK(response)) {
      dispatch({
        ...action,
        readId,
        type: readActions.types.apply,
        response,
        readValue: response.value,
      })
    } else {
      info(`Unsuccessful refreshing (read) ${readAction.uri} `, response)

      dispatch({
        ...action,
        readId,
        metadata: fromJS(response.meta),
        type: readActions.types.setRefreshMetadata,
      })
    }
  } catch (e) {
    error(`Error while refreshing (read) ${readAction.uri} `, e)

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
