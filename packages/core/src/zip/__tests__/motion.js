'use strict'

import I from 'immutable'

import * as zip from '../'
import { childrenProperty, isElement, flow } from '../../data'

import { elementChild } from '../motion'

const zipper = data => zip.elementZipper({})(data)

const data = {
  kind: ['navigation', 'tabs'],
  [childrenProperty]: ['tabs', 'settings'],
  title: 'App',
  tabs: [
    {
      kind: ['tab'],
      title: 'Murder Bot',
    },
    {
      kind: ['tab'],
      title: 'Dr Mensah',
      [childrenProperty]: ['elements', 'deeplink'],
      elements: [
        {
          kind: ['element'],
          title: 'robot',
        },
        {
          kind: ['element'],
          title: 'human',
        },
      ],
      deeplink: {
        kind: ['link'],
        title: 'goodreads',
      },
    },
  ],
  settings: {
    kind: ['settings'],
    title: 'Martha Wells',
  },
}

describe('zipper motions', () => {
  test('elementChild', () => {
    const root = zipper(I.fromJS(data))

    const storage = flow(
      root,
      elementChild('storage')
    )
    expect(storage).toBeNull()

    // child pointing to a non-collection element
    const settings = flow(
      root,
      elementChild('settings'),
      zip.node
    )
    expect(isElement(settings)).toEqual(true)
    expect(settings.get('title')).toEqual('Martha Wells')

    // child positioning to the first element of a collection
    const firstTab = flow(
      root,
      elementChild('tabs'),
      zip.node
    )
    expect(isElement(firstTab)).toEqual(true)
    expect(firstTab.get('title')).toEqual('Murder Bot')
  })
})
