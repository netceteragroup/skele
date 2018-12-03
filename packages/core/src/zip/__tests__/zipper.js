'use strict'

import I from 'immutable'

import { propNames } from '../..'
import * as skeleZip from '..'
import * as zippa from '../../vendor/zippa'

describe('zipper', () => {
  const app = I.fromJS({
    kind: ['test', 'app'],
    name: 'App',
    [propNames.children]: 'children',
    children: {
      kind: ['test', 'nav', 'tabs'],
      name: 'Tabs',
      [propNames.children]: 'tabs',
      tabs: [
        {
          kind: 'scene',
          name: 'First Tab',
          [propNames.children]: ['content'],
          content: [
            {
              kind: 'header',
              name: 'Header in First Tab',
            },
            {
              kind: 'text',
              name: 'Text One in First Tab',
            },
            {
              kind: 'text',
              name: 'Text Two in First Tab',
            },
            {
              kind: 'image',
              name: 'Image in First Tab',
              uri: 'image-uri',
            },
          ],
        },
        {
          kind: ['scene'],
          name: 'Second Tab',
        },
      ],
    },
  })
  // TODO Andon, Aleksandar: create bigger more representable application state
  // it should include multple children on some places, like 3 or 4, so that moving is representable
  // it should contain different type of children (single vs non-single), so that element structure is more complex

  const zippers = [
    { name: 'Skele Zip', zip: skeleZip },
    { name: 'Zippa Zip', zip: zippa },
  ]

  zippers.forEach(zipper => {
    const zipperName = zipper.name
    const zip = zipper.zip

    test(`${zipperName}: zip.canGoDown`, () => {
      expect(zip.canGoDown).toBeDefined()
    })
  })
})
