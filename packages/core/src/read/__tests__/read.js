'use strict'

import { List } from 'immutable'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'
import enrich from '../../enrich'
import transform from '../../transform'
import read from '..'

import * as action from '../../action'
import * as data from '../../data'

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

  const kernel = Kernel.create(
    [enrich, transform, read, app],
    {
      kind: 'app',
      '@@girders-elements/children': 'content',

      content: {
        kind: ['__read', 'scene'],
        uri: 'https://netcetera.com/test.json',
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

    const readAction = {
      type: 'READ',
      uri: content.get('uri'),
      revalidate: content.get('revalidate'),
    }

    kernel.dispatch(action.atCursor(content, readAction))

    expect(kernel.query(['content', 'kind'])).toEqualI(
      List.of('__loading', 'scene')
    )

    await sleep(300)

    content = kernel.query(['content'])
    expect(data.isExactlyOfKind('scene', content)).toBeTruthy()
    expect(content.get('title')).toEqual('Scene Title')
  })
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
