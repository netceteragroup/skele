'use strict'

import { fromJS, List } from 'immutable'
import * as SubSystem from '../../subsystem'
import * as Kernel from '../../kernel'
import * as propNames from '../../propNames'
import * as data from '../../data'

import enhanceSubsystem from '..'

const app = SubSystem.create(() => ({
  name: 'app',
}))

const { enhance } = app

describe('Enhancers', () => {
  const appState = {
    kind: 'document',
    [propNames.children]: 'children',
    data: 1,
    value: 1,
    items: [1, 2, 3],
    children: [
      {
        kind: 'teaser',
        data: 10,
        value: 10,
      },
      {
        kind: 'teaser',
        data: 20,
        value: 20,
      },
    ],
  }

  // deprecated enhancers: enhance.register :: async (el, context) => el => el
  // read dependent enhancers
  enhance.register('document', async (el, context) => {
    await sleep(randomMs(100))
    return el => el.update('data', d => d + 1)
  })
  enhance.register('document', async (el, context) => {
    await sleep(randomMs(100))
    return [['teaser', el => el.update('data', d => d + 1)]]
  })
  enhance.register('teaser', async (el, context) => {
    await sleep(randomMs(100))
    return el => el.update('data', d => d + 1)
  })

  // preferred enhancers: enhance.register :: async (context) => [[pattern, el => el], ...]
  // read independent enhancers
  enhance.register(async context => {
    await sleep(randomMs(100))
    return [[['teaser'], el => el.update('value', v => v + 2)]]
  })
  enhance.register(async context => {
    await sleep(randomMs(100))
    return el => el.update('value', v => v + 3)
  })

  test('read dependent enhancers should run only for root element', async () => {
    const kernel = Kernel.create([enhanceSubsystem, app], appState, {})
    const enhanceHelper = kernel.subsystems.enhance.buildEnhanceHelper()

    const readValue = fromJS(appState)
    const enhancers = enhanceHelper.readDependentEnhancers(
      data.kindOf(readValue)
    )
    const updates = await enhanceHelper.runEnhancers(
      readValue,
      {
        elementZipper: kernel.elementZipper,
      },
      enhancers
    )

    const result = enhanceHelper.applyEnhancements(
      readValue,
      {
        elementZipper: kernel.elementZipper,
      },
      updates
    )

    expect(result.get('data')).toEqualI(2)
    expect(result.getIn(['children', 0, 'data'])).toEqualI(11)
    expect(result.getIn(['children', 1, 'data'])).toEqualI(21)
  })

  test('read independent enhancers should apply all registered enhancements', async () => {
    const kernel = Kernel.create([enhanceSubsystem, app], appState, {})
    const enhanceHelper = kernel.subsystems.enhance.buildEnhanceHelper()
    const enhancers = enhanceHelper.readIndependentEnhancers()

    const updates = await enhanceHelper.runEnhancers(
      null,
      {
        elementZipper: kernel.elementZipper,
      },
      enhancers
    )

    const result = enhanceHelper.applyEnhancements(
      fromJS(appState),
      {
        elementZipper: kernel.elementZipper,
      },
      updates
    )

    expect(result.get('value')).toEqualI(4)
    expect(result.getIn(['children', 0, 'value'])).toEqualI(12)
    expect(result.getIn(['children', 1, 'value'])).toEqualI(22)
  })
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const randomMs = max => Math.trunc(max * Math.random()) + 1
