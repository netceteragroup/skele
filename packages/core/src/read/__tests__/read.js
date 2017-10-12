'use strict'

import { List } from 'immutable'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import enrich from '../../enrich'
import transform from '../../transform'
import update from '../../update'
import effect from '../../effect'
import read from '..'

import * as action from '../../action'
import * as data from '../../data'

import * as readActions from '../actions'
import * as propNames from '../../propNames'

describe('Read Subsytem', () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  app.read.register(/test.json$/, u =>
    Promise.resolve({
      value: { kind: 'scene', title: 'Scene Title' },
      meta: app.read.http.responseMeta({ url: u }),
    })
  )

  app.read.register(/failure.json$/, u => Promise.reject(new Error('fail')))

  const kernel = Kernel.create(
    [enrich, transform, effect, update, read, app],
    {
      kind: 'app',
      [propNames.children]: ['content', 'failure'],

      content: {
        kind: ['__read', 'scene'],
        uri: 'https://netcetera.com/test.json',
      },

      failure: {
        kind: ['__read', 'scene'],
        uri: 'https://netcetera.com/failure.json',
      },
    },
    {
      data: {
        defaultChildPositions: ['children'],
      },
    }
  )

  it('processes reads successfully', async () => {
    let content = kernel.query(['content'])

    const readAction = readActions.read(content.get('uri'), {
      revalidate: content.get('revalidate'),
    })

    kernel.dispatch(action.atCursor(content, readAction))

    expect(List(kernel.query(['content', 'kind']))).toEqualI(
      List.of('__loading', 'scene')
    )

    await sleep(300)

    content = kernel.query(['content'])
    expect(data.isExactlyOfKind('scene', content)).toBeTruthy()
    expect(content.get('title')).toEqual('Scene Title')
  })

  it('handles failures', async () => {
    let content = kernel.query(['failure'])

    const readAction = readActions.read(content.get('uri'), {
      revalidate: content.get('revalidate'),
    })

    kernel.dispatch(action.atCursor(content, readAction))

    await sleep(60)

    content = kernel.query(['failure'])
    expect(data.isOfKind('__error', content)).toBeTruthy()
  })
})

describe('Refreshing', () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  let counter = 0
  app.read.register(/test.json$/, u => {
    counter += 1

    return Promise.resolve({
      value: { kind: 'scene', title: `Scene Title ${counter}` },
      meta: app.read.http.responseMeta({ url: u }),
    })
  })

  const refresher = jest.fn()
  refresher.mockReturnValue(
    Promise.resolve({
      value: { kind: 'scene', title: 'Scene Title X' },
      meta: app.read.http.responseMeta({ url: 'https://netcetera.com/x.json' }),
    })
  )

  app.read.register(/x.json$/, refresher)

  app.read.register(/fail.json$/, () => Promise.reject(new Error('fail')))

  afterEach(() => {
    refresher.mockClear()
  })

  const kernel = Kernel.create([enrich, transform, effect, update, read, app], {
    kind: 'app',
    [propNames.children]: ['content'],

    content: {
      kind: ['__read', 'scene'],
      uri: 'https://netcetera.com/test.json',
    },
  })

  test('refresh', async () => {
    let content = kernel.query(['content'])

    kernel.dispatch(
      action.atCursor(content, readActions.read(content.get('uri')))
    )

    await sleep(60)

    content = kernel.query(['content'])
    expect(content.get('title')).toEqual('Scene Title 1')

    kernel.dispatch(action.atCursor(content, readActions.readRefresh()))

    await sleep(60)

    content = kernel.query(['content'])
    expect(content.get('title')).toEqual('Scene Title 2')

    kernel.dispatch(
      action.atCursor(
        content,
        readActions.readRefresh('https://netcetera.com/x.json')
      )
    )

    await sleep(60)

    content = kernel.query(['content'])
    expect(content.get('title')).toEqual('Scene Title X')

    expect(refresher.mock.calls[0][0]).toEqual('https://netcetera.com/x.json')
    expect(refresher.mock.calls[0][1]).toMatchObject({ revalidate: true })

    kernel.dispatch(
      action.atCursor(
        content,
        readActions.readRefresh('https://netcetera.com/fail.json')
      )
    )

    await sleep(60)

    content = kernel.query(['content'])
    expect(content.get('title')).toEqual('Scene Title X')
    expect(content.getIn([propNames.metadata, 'refreshing'])).not.toBeTruthy()
  })
})
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
