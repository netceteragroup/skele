'use strict'

import I from 'immutable'

import * as zip from '../'
import { childrenProperty, flow } from '../../data'

import { propEq } from '../predicate'

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

describe('zipper predicates', () => {
  test('propEq', () => {
    const root = zipper(I.fromJS(data))
    expect(
      flow(
        root,
        propEq(
          'settings',
          I.fromJS({ kind: ['settings'], title: 'Martha Wells' })
        )
      )
    ).toBeTruthy()
  })
})
