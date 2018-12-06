'use strict'

import I from 'immutable'
import R from 'ramda'

import { propNames } from '../..'
import * as skeleZip from '..'
import * as zippa from '../../vendor/zippa'
import elementZipper from '../elementZipper'

describe('zipper', () => {
  const app = {
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
          [propNames.children]: ['main', 'sidebar'],
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
            [propNames.children]: ['content'],
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
  const immutableApp = I.fromJS(app)

  // TODO Andon, Aleksandar: create bigger more representable application state
  // it should include multple children on some places, like 3 or 4, so that moving is representable
  // it should contain different type of children (single vs non-single), so that element structure is more complex
  const elementZipperApp = elementZipper({
    defaultChildPositions: ['children'],
  })(immutableApp)
  const zippers = [
    { name: 'Skele Zip', zip: skeleZip },
    { name: 'Zippa Zip', zip: zippa },
  ]
  let counters = [0, 0]
  const elemTrans = (el, idx) => {
    if (el) {
      counters[idx] = counters[idx] + 1
      return el.setIn(['name'], counters[idx])
    }
    return el
  }

  // TESTS
  zippers.forEach((zipper, idx) => {
    const zipperName = zipper.name
    const zip = zipper.zip

    const trans = R.pipe(
      zip.postWalk(el => elemTrans(el, idx)),
      zip.value
    )

    const result = trans(elementZipperApp)

    expect(result).toBe('')

    test.skip(`${zipperName}: zip.canGoDown`, () => {
      expect(zip.canGoDown).toBeDefined()
    })
  })
})
