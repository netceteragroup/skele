'use strict'

import React from 'react'
import { List } from 'immutable'
import { mount } from 'enzyme'

import {
  Kernel,
  Subsystem,
  zip,
  data,
  propNames,
  defaultSubsystems,
  actions,
  read,
  ui,
  update,
  http,
  Engine,
} from '..'

describe('Pre-Fetching', () => {
  // application state
  const initState = {
    kind: 'app',
    [propNames.children]: 'stack',
    stack: {
      kind: ['navigation', 'stack'],
      [propNames.children]: 'scenes',
      scenes: [
        {
          kind: ['__read', 'scene'],
          uri: 'https://netcetera.com/mistery.json',
        },
      ],
    },
  }

  beforeEach(() => {
    ui.register('app', ({ uiFor }) => {
      return <div>App: {uiFor('stack')}</div>
    })
    ui.register(['navigation', 'stack'], ({ uiFor }) => {
      return <div>Stack: {uiFor('scenes')}</div>
    })
    ui.register('scene', ({ uiFor }) => {
      return <div>Scene: {uiFor('content')}</div>
    })
    ui.register('teaser', ({ element }) => {
      return (
        <div>
          <div>Teaser</div>
          <div>Title: {element.get('title')}</div>
          <div>Uri: {element.get('uri')}</div>
          <div>Content: {element.get('content')}</div>
        </div>
      )
    })
    update.register('teaser', 'load', (teaser, action) =>
      teaser.set('content', action.result)
    )
    read.register(/mistery\.json$/, u =>
      Promise.resolve({
        value: {
          kind: 'scene',
          [propNames.children]: 'content',
          content: [
            {
              kind: 'teaser',
              title: 'Sherlock Holmes',
              uri: 'https://en.wikipedia.org/wiki/Sherlock_Holmes',
            },
            {
              kind: 'teaser',
              title: 'John Watson',
              uri: 'https://en.wikipedia.org/wiki/Dr._Watson',
            },
            {
              kind: 'teaser',
              title: 'Martha Hudson',
              uri:
                'https://en.wikipedia.org/wiki/Minor_Sherlock_Holmes_characters#Mrs._Hudson',
            },
          ],
        },
        meta: http.responseMeta({ url: u }),
      })
    )
  })

  afterEach(() => {
    ui.reset()
  })

  it('should perform prefetch for certain elements', async () => {
    const prefetchSubsystem = Subsystem.create(system => ({
      name: 'prefetch',
      middleware: store => next => action => {
        const nextState = next(action)
        if (action.type === 'READ_SUCCEEDED') {
          const toPrefetch = zip.reduceZipper(
            zip.when(
              e => data.isOfKind('teaser', e),
              (acc, el) => acc.push(el)
            ),
            List(),
            zip.elementZipper({})(store.getState())
          )
          toPrefetch.map(teaser => {
            store.dispatch(
              actions.atCursor(teaser, {
                type: 'load',
                result: 'result-' + teaser.get('uri'),
              })
            )
          })
        }
        return nextState
      },
    }))

    const { effect } = prefetchSubsystem
    effect.register()

    const engine = mount(
      <Engine
        initState={initState}
        additionalSubsystems={[prefetchSubsystem]}
      />
    )
    const loadingEls = engine.findWhere(c =>
      data.isOfKind('__loading', c.prop('element'))
    )
    expect(loadingEls.length).toBeGreaterThan(0)

    let html = engine.html()
    expect(html).toMatch('loading...')
    expect(html).not.toMatch('Scene')

    await new Promise(resolve => setTimeout(resolve, 100))

    html = engine.html()
    expect(html).not.toMatch('loading...')
    expect(html).toMatch('Scene')

    expect(html).toMatch('Sherlock Holmes')
    expect(html).toMatch('result-https://en.wikipedia.org/wiki/Sherlock_Holmes')
  })
})
