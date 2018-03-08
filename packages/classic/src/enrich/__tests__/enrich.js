'use strict'

import { fromJS, List } from 'immutable'
import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import * as propNames from '../../propNames'
import * as data from '../../data'

import enrichSubsystem from '..'

const app = Subsystem.create(() => ({
  name: 'app',
}))

const { enrich } = app

describe('Enrichers', () => {
  const appState = {
    kind: 'c1',
    [propNames.children]: 'children',
    data: 1,
    children: [
      {
        kind: 'c1',
        [propNames.children]: 'children',
        data: 11,

        children: [
          {
            kind: 'c1',
            data: 111,
          },
          {
            kind: 'c1',
            data: 112,
          },
          {
            kind: 'c2',
            items: [1, 2, 3],
          },
        ],
      },
      {
        kind: 'c2',
        items: [10, 20],
      },
    ],
  }

  enrich.register('c1', async el => {
    await sleep(randomMs(100))

    return el.update('data', data => data + 1000)
  })

  enrich.register('c1', async el => {
    await sleep(randomMs(100))

    const sum = el
      .get('children', List())
      .filter(data.isOfKind('c1'))
      .map(el => el.get('data', 0))
      .reduce((a, b) => a + b, el.get('sum', 0))

    const items = el
      .get('children', List())
      .map(el => el.get('items', List()))
      .reduce((a, b) => a.concat(b), List())

    return el
      .update('items', i => List(i).concat(items))
      .update('data', d => d + sum)
  })

  enrich.register('c2', async el => {
    await sleep(randomMs(150))

    return el.update('items', items => items.push(100))
  })

  test('enrichers run concurrently for all children, before the parent', async () => {
    const kernel = Kernel.create([enrichSubsystem, app], appState, {})
    const enricher = kernel.subsystems.enrich.buildEnricher()

    const result = await enricher(fromJS(appState))

    expect(result.getIn(['children', 0, 'children', 2, 'items'])).toEqualI(
      List.of(1, 2, 3, 100)
    )

    expect(result.getIn(['children', 1, 'items'])).toEqualI(
      List.of(10, 20, 100)
    )

    expect(result.getIn(['children', 0, 'children', 0, 'data'])).toEqual(1111)
    expect(result.getIn(['children', 0, 'data'])).toEqual(1011 + 1111 + 1112)
    expect(result.getIn(['data'])).toEqual(1011 + 1111 + 1112 + 1001)
    expect(result.getIn(['items'])).toEqualI(List.of(1, 2, 3, 100, 10, 20, 100))
  })
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomMs(max) {
  return Math.trunc(max * Math.random()) + 1
}
