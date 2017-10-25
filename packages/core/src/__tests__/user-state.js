'use strict'

import { List } from 'immutable'
import {
  actions,
  data,
  defaultSubsystems,
  Kernel,
  propNames,
  Subsystem,
  zip,
} from '..'
import { when } from '../data/index'

describe('User State', () => {
  const initState = {
    kind: ['app'],
    [propNames.children]: 'navigation',
    navigation: {
      kind: ['navigation'],
      [propNames.children]: ['hamburger', 'stack'],
      hamburger: {
        kind: ['navigation', 'hamburger'],
        [propNames.children]: 'items',
        items: [
          {
            kind: ['user'],
            content: {
              isLoggedIn: true,
              name: 'Sherlock',
              surname: 'Holmes',
            },
          },
          {
            kind: ['personal', 'status'],
            content: {
              isLoggedIn: true,
              name: 'Sherlock',
              surname: 'Holmes',
            },
          },
          {
            kind: ['logout'],
          },
        ],
      },
      stack: {
        kind: ['navigation', 'stack'],
        [propNames.children]: 'stack',
        stack: [
          {
            kind: ['scene', 'intro'],
          },
          {
            kind: ['scene', 'main'],
            [propNames.children]: 'content',
            content: [
              {
                kind: ['personal', 'status'],
                content: {
                  isLoggedIn: true,
                  name: 'Sherlock',
                  surname: 'Holmes',
                },
              },
              {
                kind: ['personal', 'feed'],
              },
              {
                kind: 'logout',
              },
            ],
          },
        ],
      },
    },
  }
  const userStateSubsystem = Subsystem.create(system => ({
    name: 'user-state',
  }))
  const { effect, update } = userStateSubsystem
  const theKernel = Kernel.create(
    [...defaultSubsystems, userStateSubsystem],
    initState,
    {}
  )

  effect.forKind(['app'], effects => {
    effects.register('.logout', async (context, action) => {
      console.log('zipper', context.elementZipper())
      try {
        const toPrefetch = zip.preReduce(
          when(
            e => data.isOfKind(['personal', 'status'], e),
            (acc, el) => acc.push(el)
          ),
          List(),
          context.elementZipper(context.query())
        )
        console.log('toPrefetch', toPrefetch.count())
      } catch (e) {
        console.log('error', e)
      }

      console.log('result', 'ends')
    })

    update.register(['app'], '.logout', app => {
      console.log('sdafasdf')
      return app
    })
  })
  it('test', () => {
    // console.log('kernel', theKernel)
    // console.log('kernel', theKernel.query(['ui']))
    const logoutAction = actions.atCursor(
      theKernel.query(['navigation', 'stack']),
      {
        type: '.logout',
      }
    )
    theKernel.dispatch(logoutAction)
  })
})
