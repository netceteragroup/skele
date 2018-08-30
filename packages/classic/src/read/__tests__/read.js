'use strict'

import { List } from 'immutable'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import enrich from '../../enrich'
import enhance from '../../enhance'
import transform from '../../transform'
import update from '../../update'
import effect from '../../effect'
import read from '..'
import * as http from '../http'

import * as action from '../../action'
import { data } from '@skele/core'

import * as readActions from '../actions'
import * as propNames from '../../propNames'

describe('Read Subsystem', () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  app.read.register(/test.json$/, u =>
    Promise.resolve(http.asResponse({ kind: 'scene', title: 'Scene Title' }, u))
  )

  app.read.register(/failure.json$/, () => Promise.reject(new Error('fail')))

  const kernel = Kernel.create(
    [enrich, enhance, transform, effect, update, read, app],
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
    expect(content.getIn([propNames.metadata, 'request']).toJS()).toEqual(
      readAction
    )
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

describe('Read function', () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  const readFn = jest.fn()
  readFn.mockReturnValue(
    Promise.resolve(
      http.asResponse(
        { kind: 'scene', title: 'Scene Title X' },
        'https://netcetera.com/x.json'
      )
    )
  )
  afterEach(() => readFn.mockClear())

  app.read.register(/test.json$/, readFn)

  const kernel = Kernel.create(
    [enrich, enhance, transform, effect, update, read, app],
    {
      kind: 'app',
      [propNames.children]: ['content'],

      content: {
        kind: ['__read', 'scene'],
        uri: 'https://netcetera.com/test.json',
      },
    },
    { foo: 1 }
  )

  test('read fn parameters', async () => {
    let content = kernel.query(['content'])

    kernel.dispatch(
      action.atCursor(
        content,
        readActions.read(content.get('uri'), {
          revalidate: true,
          alpha: 'beta',
        })
      )
    )

    await sleep(60)

    expect(readFn).toHaveBeenCalledWith(
      'https://netcetera.com/test.json',
      {
        revalidate: true,
        alpha: 'beta',
      },
      expect.any(Object)
    )

    const context = readFn.mock.calls[0][2]
    expect(context).toHaveProperty('config', { foo: 1 })
    expect(context).toHaveProperty('subsystems', expect.any(Object))
    expect(context).toHaveProperty('subsystemSequence', expect.any(Array))
  })
})
describe('Refreshing', () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  let counter = 0
  app.read.register(/test.json$/, u => {
    counter += 1

    return Promise.resolve(
      http.asResponse({ kind: 'scene', title: `Scene Title ${counter}` }, u)
    )
  })

  const refresher = jest.fn()
  refresher.mockReturnValue(
    Promise.resolve(
      http.asResponse(
        { kind: 'scene', title: 'Scene Title X' },
        'https://netcetera.com/x.json'
      )
    )
  )

  app.read.register(/x.json$/, refresher)

  app.read.register(/fail.json$/, () => Promise.reject(new Error('fail')))

  afterEach(() => {
    refresher.mockClear()
  })

  const kernel = Kernel.create(
    [enrich, enhance, transform, effect, update, read, app],
    {
      kind: 'app',
      [propNames.children]: ['content'],

      content: {
        kind: ['__read', 'scene'],
        uri: 'https://netcetera.com/test.json',
        revalidate: true,
      },
    }
  )

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
        readActions.readRefresh('https://netcetera.com/x.json', { foo: 'bar' })
      )
    )

    await sleep(60)

    content = kernel.query(['content'])
    expect(content.get('title')).toEqual('Scene Title X')

    expect(refresher.mock.calls[0][0]).toEqual('https://netcetera.com/x.json')
    expect(refresher.mock.calls[0][1]).toMatchObject({
      revalidate: true,
      foo: 'bar',
    })

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

    const status = content.getIn([
      propNames.metadata,
      'failedRefresh',
      'status',
    ])
    expect(status >= 200 && status < 300).not.toBeTruthy()
  })
})

describe('Performing reads manually', async () => {
  const app = Subsystem.create(() => ({
    name: 'app',
  }))

  const readFn = jest.fn()
  readFn.mockReturnValue(
    Promise.resolve(
      http.asResponse(
        { kind: 'scene', title: 'Scene Title X' },
        'https://netcetera.com/test.json'
      )
    )
  )
  afterEach(() => readFn.mockClear())

  app.read.register(/test.json$/, readFn)

  const kernel = Kernel.create(
    [enrich, enhance, transform, effect, update, read, app],
    {
      kind: 'app',
    }
  )

  const result = await kernel.subsystems.read.perform(
    'https://netcetera.com/test.json',
    { revalidate: true, a: 1 }
  )

  expect(readFn).toHaveBeenCalledWith(
    'https://netcetera.com/test.json',
    {
      revalidate: true,
      a: 1,
    },
    expect.anything() // the context
  )

  expect(result.value.get('title')).toEqual('Scene Title X')
  expect(result.value.getIn([propNames.metadata, 'uri'])).toEqual(
    'https://netcetera.com/test.json'
  )
  expect(
    result.value.getIn([propNames.metadata, 'request']).toJS()
  ).toMatchObject({
    revalidate: true,
    a: 1,
    uri: 'https://netcetera.com/test.json',
  })
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
