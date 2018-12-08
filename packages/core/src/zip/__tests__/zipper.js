'use strict'

import I from 'immutable'
import R from 'ramda'

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

const tabs = I.fromJS(app).getIn(['children'])

const zipperFor = app =>
  elementZipper({
    defaultChildPositions: ['children', 'content', 'tabs', 'main', 'sidebar'],
  })(I.fromJS(app))

const test_down = (zip, zipperName) => {
  const testName = 'zip.down'

  // 1. child collection
  test(`${zipperName}: ${testName}, first .down should get to @@skele/child-collection`, () => {
    const result = R.pipe(
      zipperFor,
      zip.down,
      zip.value
    )(app)
    expect(result.get('kind')).toEqual('@@skele/child-collection')
  })

  // 2. tabs
  test(`${zipperName}: ${testName}, twice .down from root should take us to tabs`, () => {
    const result = R.pipe(
      zipperFor,
      zip.down,
      zip.down,
      zip.value
    )(app)

    expect(result).toEqual(tabs)
  })

  const headerInFirstTab = I.fromJS({
    kind: 'header',
    name: 'Header in First Tab',
  })

  // 3. first header
  test(`${zipperName}: ${testName}, twice down from firstTab should take us to the Header (remember child-collection) `, () => {
    const firstTab = I.fromJS(app)
      .getIn(['children', 'tabs'])
      .first()
    const result = R.pipe(
      zipperFor,
      zip.down,
      zip.down,
      zip.value
    )(firstTab)

    expect(result).toEqual(I.fromJS(headerInFirstTab))
  })

  // 4. first header 2
  test(`${zipperName}: ${testName}, 6x down from root should take us to the Header (remember child-collection) `, () => {
    const result = R.pipe(
      zipperFor,
      zip.down,
      zip.down,
      zip.down,
      zip.down,
      zip.down,
      zip.down,
      zip.value
    )(app)

    expect(result).toEqual(I.fromJS(headerInFirstTab))
  })

  // 5. undefined
  test(`${zipperName}: ${testName}, headerFirstTab (no children) .down should return undefined`, () => {
    const result = R.pipe(
      zipperFor,
      zip.down,
      zip.value
    )(headerInFirstTab)

    expect(result).toEqual(undefined)
  })

  // 6. error
  test(`${zipperName}: ${testName}, .down of undefined should throw error`, () => {
    expect(() => {
      zip.down(undefined)
    }).toThrow()
  })
}

const test_right = (zip, zipperName) => {
  const testName = 'zip.right'

  test.skip(`${zipperName}: ${testName}, .right form the root should be null`, () => {
    const result = R.pipe(
      zipperFor,
      zip.right
    )(app)

    expect(result).toEqual(null)
  })

  test(`${zipperName}: ${testName}, .right form the first tab should be the second`, () => {
    const firstTab = R.pipe(
      zipperFor,
      zip.down,
      zip.down
    )(tabs)

    const secondTab = {
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
    }

    const result = R.pipe(
      zip.right,
      zip.value
    )(firstTab)

    expect(result).toEqual(I.fromJS(secondTab))
  })

  // todo: receiving an object instead of null, zip.value is undefined
  test.skip(`${zipperName}: ${testName}, .right form the second tab should be null`, () => {
    const secondTab = R.pipe(
      zipperFor,
      zip.down,
      zip.right
    )(tabs)

    expect(zip.right(secondTab)).toEqual(null)
  })
}

const test_up = (zip, zipperName) => {
  const testName = 'zip.up'

  test(`${zipperName}: ${testName}, what goes down must come up`, () => {
    const down = R.pipe(
      zipperFor,
      zip.down
    )(app)

    const up = R.pipe(
      zip.up,
      zip.value
    )(down)

    expect(up).toEqual(I.fromJS(app))
  })

  test(`${zipperName}: ${testName}, what goes down x3 must come up x3`, () => {
    const down = R.pipe(
      zipperFor,
      zip.down,
      zip.down,
      zip.down
    )(app)

    const up = R.pipe(
      zip.up,
      zip.up,
      zip.up,
      zip.value
    )(down)

    expect(up).toEqual(I.fromJS(app))
  })

  test.skip(`${zipperName}: ${testName}, .up form the root should be null`, () => {
    const result = R.pipe(
      zipperFor,
      zip.up
    )(app)

    expect(result).toEqual(null)
  })
}

const test_edit = (zip, zipperName) => {
  const modify = el => el.set('name', 'modified')

  test(`${zipperName}: zip.up observes and reflects the change that zip.edit does`, () => {
    // immutable
    const tabsValue = I.fromJS(app).getIn(['children'])
    const tabsValueModified = modify(tabsValue)

    // zipper
    const tabs = R.pipe(
      zipperFor,
      zip.down,
      zip.down
    )(app)
    const tabsEdited = zip.edit(modify, tabs)

    const result = R.pipe(
      zip.up,
      zip.down,
      zip.value
    )(tabsEdited)

    // todo: different form zippa check up.path.parentPath
    // const up = zip.up(tabsModified)
    // expect(up.path.parentPath).toEqual('')

    expect(result).toEqual(tabsValueModified)
  })

  test(`${zipperName}: zip.edit, path.changed should be true for edited zipper`, () => {
    const headerInFirstTab = zipperFor({
      kind: 'header',
      name: 'Header in First Tab',
    })
    const result = zip.edit(modify, headerInFirstTab)

    expect(result.path.changed).toEqual(true)
  })
}

const test_canGoRight = (zip, zipperName) => {
  test(`${zipperName}: zip.canGoRight, false for app root`, () => {
    expect(zip.canGoRight(zipperFor(app))).toEqual(false)
  })

  test(`${zipperName}: zip.canGoRight, true for first tab`, () => {
    const firstTab = R.pipe(
      zipperFor,
      zip.down,
      zip.down
    )(tabs)

    expect(zip.canGoRight(firstTab)).toEqual(true)
  })

  test(`${zipperName}: zip.canGoRight, false for second(last) tab`, () => {
    const secondTab = R.pipe(
      zipperFor,
      zip.down,
      zip.right
    )(tabs)

    expect(zip.canGoRight(secondTab)).toEqual(false)
  })
}

const test_canGoDown = (zip, zipperName) => {
  test(`${zipperName}: zip.canGoDown, true for app root`, () => {
    expect(zip.canGoDown(zipperFor(app))).toEqual(true)
  })

  test(`${zipperName}: zip.canGoDown, false for empty header`, () => {
    const emptyHeader = { kind: 'header', name: 'empty header' }
    expect(zip.canGoDown(zipperFor(emptyHeader))).toEqual(false)
  })
}

describe('zipper', () => {
  // we want all the tests to be excersized both zippa and our custom zipper implementation
  const zippers = [
    { name: 'Skele Zip', zip: skeleZip },
    { name: 'Zippa Zip', zip: zippa },
  ]

  zippers.forEach(zipper =>
    R.juxt([
      test_down,
      test_right,
      test_up,
      test_edit,
      test_canGoDown,
      test_canGoRight,
    ])(zipper.zip, zipper.name)
  )
})
