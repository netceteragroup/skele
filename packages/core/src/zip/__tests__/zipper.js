'use strict'

import I from 'immutable'

import { data } from '../../'
import * as skeleZip from '..'
import * as zippa from '../../vendor/zippa'

const { elementZipper } = skeleZip

const app = {
  kind: ['test', 'app'],
  name: 'App',
  children: {
    kind: ['test', 'nav', 'tabs'],
    name: 'Tabs',
    tabs: [
      {
        kind: 'scene',
        name: 'First Tab',
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
        main: [
          {
            kind: ['header'],
            name: 'Header in Second Tab Main',
          },
          {
            kind: ['text'],
            name: 'Text One in Second Tab Main',
          },
          {
            kind: ['text'],
            name: 'Text Two in Second Tab Main',
          },
          {
            kind: ['image'],
            name: 'Image in Second Tab Main',
            uri: 'image-uri',
          },
        ],
        sidebar: {
          kind: 'overlay',
          name: 'Sidebar in Second Tab',
          content: [
            {
              kind: ['overlay', 'header'],
              name: 'Header in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'text'],
              name: 'Text One in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'text'],
              name: 'Text Two in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'image'],
              name: 'Image in Second Tab Sidebar',
              uri: 'image-uri',
            },
          ],
        },
      },
    ],
  },
}

const zipperFor = app =>
  elementZipper({
    defaultChildPositions: ['children', 'content', 'tabs', 'main', 'sidebar'],
  })(I.fromJS(app))

describe('zipper', () => {
  // we want all the tests to be excersized both zippa and our custom zipper implementation
  const zippers = [
    { name: 'Skele Zip', zip: skeleZip },
    { name: 'Zippa Zip', zip: zippa },
  ]

  zippers.forEach(zipper => {
    const zipperName = zipper.name
    const zip = zipper.zip

    test(`${zipperName}: down...`, () => {})
  })
})
