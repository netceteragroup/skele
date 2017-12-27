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
    items: [1, 2, 3],
    children: [
      {
        kind: 'teaser',
        data: 10,
      },
      {
        kind: 'teaser',
        data: 20,
      },
    ],
  }

  const incrementData = async el => {
    await sleep(randomMs(100))

    return el => el.update('data', d => d + 1)
  }

  enhance.register('document', incrementData)
  enhance.register('teaser', incrementData)

  test('enhancers should run only for root element', async () => {
    const kernel = Kernel.create([enhanceSubsystem, app], appState, {})
    const enhancer = kernel.subsystems.enhance.buildEnhancer()

    const result = await enhancer(fromJS(appState))

    expect(result.get('data')).toEqualI(2)
    expect(result.getIn(['children', 0, 'data'])).toEqualI(10)
    expect(result.getIn(['children', 1, 'data'])).toEqualI(20)
  })

  const appendItem = item => async el => {
    await sleep(randomMs(100))

    return el => el.update('items', items => items.concat(item))
  }

  enhance.register(['document'], appendItem(10))
  enhance.register(['document'], appendItem(100))

  test('enhancers should apply all registered enhancments', async () => {
    const kernel = Kernel.create([enhanceSubsystem, app], appState, {})
    const enhancer = kernel.subsystems.enhance.buildEnhancer()

    const result = await enhancer(fromJS(appState))

    expect(result.get('items')).toEqualI(List.of(1, 2, 3, 10, 100))
  })
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const randomMs = max => Math.trunc(max * Math.random()) + 1
