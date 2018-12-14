'use strict'

import I from 'immutable'

import { data } from '../../'
import * as skeleZip from '..'
import * as zippa from 'zippa'

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

const appPreWalked = {
  kind: ['test', 'app'],
  name: '1. App',
  children: {
    kind: ['test', 'nav', 'tabs'],
    name: '2. Tabs',
    tabs: [
      {
        kind: 'scene',
        name: '3. First Tab',
        content: [
          {
            kind: 'header',
            name: '4. Header in First Tab',
          },
          {
            kind: 'text',
            name: '5. Text One in First Tab',
          },
          {
            kind: 'text',
            name: '6. Text Two in First Tab',
          },
          {
            kind: 'image',
            name: '7. Image in First Tab',
            uri: 'image-uri',
          },
        ],
      },
      {
        kind: ['scene'],
        name: '8. Second Tab',
        main: [
          {
            kind: ['header'],
            name: '9. Header in Second Tab Main',
          },
          {
            kind: ['text'],
            name: '10. Text One in Second Tab Main',
          },
          {
            kind: ['text'],
            name: '11. Text Two in Second Tab Main',
          },
          {
            kind: ['image'],
            name: '12. Image in Second Tab Main',
            uri: 'image-uri',
          },
        ],
        sidebar: {
          kind: 'overlay',
          name: '13. Sidebar in Second Tab',
          content: [
            {
              kind: ['overlay', 'header'],
              name: '14. Header in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'text'],
              name: '15. Text One in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'text'],
              name: '16. Text Two in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'image'],
              name: '17. Image in Second Tab Sidebar',
              uri: 'image-uri',
            },
          ],
        },
      },
    ],
  },
}

const appPostWalked = {
  kind: ['test', 'app'],
  name: '17. App',
  children: {
    kind: ['test', 'nav', 'tabs'],
    name: '16. Tabs',
    tabs: [
      {
        kind: 'scene',
        name: '5. First Tab',
        content: [
          {
            kind: 'header',
            name: '1. Header in First Tab',
          },
          {
            kind: 'text',
            name: '2. Text One in First Tab',
          },
          {
            kind: 'text',
            name: '3. Text Two in First Tab',
          },
          {
            kind: 'image',
            name: '4. Image in First Tab',
            uri: 'image-uri',
          },
        ],
      },
      {
        kind: ['scene'],
        name: '15. Second Tab',
        main: [
          {
            kind: ['header'],
            name: '6. Header in Second Tab Main',
          },
          {
            kind: ['text'],
            name: '7. Text One in Second Tab Main',
          },
          {
            kind: ['text'],
            name: '8. Text Two in Second Tab Main',
          },
          {
            kind: ['image'],
            name: '9. Image in Second Tab Main',
            uri: 'image-uri',
          },
        ],
        sidebar: {
          kind: 'overlay',
          name: '14. Sidebar in Second Tab',
          content: [
            {
              kind: ['overlay', 'header'],
              name: '10. Header in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'text'],
              name: '11. Text One in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'text'],
              name: '12. Text Two in Second Tab Sidebar',
            },
            {
              kind: ['overlay', 'image'],
              name: '13. Image in Second Tab Sidebar',
              uri: 'image-uri',
            },
          ],
        },
      },
    ],
  },
}

const countedTransformer = () => {
  let counter = 0
  return el => {
    if (el.getIn(['name'])) {
      counter = counter + 1
      return el.setIn(['name'], `${counter}. ${el.getIn(['name'])}`)
    }
    return el
  }
}

describe('zipper', () => {
  // we want all the tests to be excersized both zippa and our custom zipper implementation
  const zippers = [
    { name: 'Skele Zip', zip: skeleZip },
    { name: 'Zippa Zip', zip: zippa },
  ]

  const zipperFor = (app, zip) =>
    elementZipper({
      defaultChildPositions: ['children', 'content', 'tabs', 'main', 'sidebar'],
      makeZipperOverride: zip.makeZipper,
    })(I.fromJS(app))

  zippers.forEach(zipper => {
    const zipperName = zipper.name
    const zip = zipper.zip

    test(`${zipperName}: postWalk`, () => {
      expect(zip.postWalk).toBeDefined()
      const result = data.flow(
        zipperFor(app, zip),
        zip.postWalk(countedTransformer()),
        zip.value
      )
      expect(result).toEqualI(I.fromJS(appPostWalked))
    })

    test(`${zipperName}: preWalk`, () => {
      expect(zip.preWalk).toBeDefined()
      const result = data.flow(
        zipperFor(app, zip),
        zip.preWalk(countedTransformer()),
        zip.value
      )
      expect(result).toEqualI(I.fromJS(appPreWalked))
    })
  })
})
