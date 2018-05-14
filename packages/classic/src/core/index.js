'use strict'

import React from 'react'

import * as SubSystem from '../subsystem'

// default subsystems

import enrich from '../enrich'
import enhance from '../enhance'
import transform from '../transform'
import read from '../read'
import effect from '../effect'
import update from '../update'
import ui from '../ui'

import Read from './elements/read'
import Loading from './elements/loading'
import Error from './elements/error'

import * as propNames from '../propNames'
/**
 * This is the 'default' subsystem where all 'global' registrations go to
 */
const core = SubSystem.create(() => ({
  name: 'core',
}))

/**
 * The list of default subsystems
 */
export const defaultSubsystems = [
  enrich,
  enhance,
  transform,
  effect,
  update,
  read,
  ui,
  core,
]
core.defaultSubsystems = defaultSubsystems

// default registrations

core.read.register(core.read.default, core.read.http.httpRead)

core.ui.register(['__read'], ({ element, dispatch }) => {
  const opts = element
    .delete('kind')
    .delete('uri')
    .delete(propNames.children)
    .toJS()

  return <Read uri={element.get('uri')} opts={opts} dispatch={dispatch} />
})
core.ui.register(['__loading'], ({ element, dispatch }) => {
  return (
    <Loading
      kind={element.get('kind').toJS()}
      uri={element.get('uri')}
      dispatch={dispatch}
      readId={element.get('readId')}
      revalidate={element.get('revalidate')}
    />
  )
})
core.ui.register(['__error'], Error)

export default core
