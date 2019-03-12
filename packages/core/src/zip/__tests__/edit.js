'use strict'

import { fromJS } from 'immutable'
import * as zip from '..'
import * as R from 'ramda'

describe('Editing a Zipper', () => {
  const organization = {
    kind: 'pm',
    name: 'alex',
    children: [
      {
        kind: 'tc',
        name: 'zdravko',
        children: [
          {
            kind: 'tm',
            name: 'emilija',
          },
          {
            kind: 'tm',
            name: 'filip',
          },
        ],
      },
      {
        kind: 'tc',
        name: 'andon',
        children: [
          {
            kind: ['tm', 'yoga'],
            name: 'blagoja',
          },
          {
            kind: 'tm',
            name: 'goran',
          },
        ],
      },
      {
        kind: 'tc',
        name: 'ognen',
      },
    ],
  }

  const createElementZipper = () =>
    zip.elementZipper({
      defaultChildPositions: 'children',
    })(fromJS(organization))

  test('editCond() -- conditional editing of nodes in an entire tree', () => {
    // given
    const elementZipper = createElementZipper()

    // when
    const result = zip.editCond(
      [
        [
          item => item.get('name') === 'andon',
          item => item.set('name', 'sikavica'),
        ],
        [['tm', 'yoga'], item => item.update('name', name => `yoga-${name}`)],
        ['tm', item => item.update('name', name => `member-${name}`)],
      ],
      elementZipper
    )

    // then
    expect(zip.node(result)).toEqualI(
      fromJS({
        kind: 'pm',
        name: 'alex',
        children: [
          {
            kind: 'tc',
            name: 'zdravko',
            children: [
              {
                kind: 'tm',
                name: 'member-emilija', // changed
              },
              {
                kind: 'tm',
                name: 'member-filip', // changed
              },
            ],
          },
          {
            kind: 'tc',
            name: 'sikavica', // changed
            children: [
              {
                kind: ['tm', 'yoga'],
                name: 'yoga-member-blagoja', // changed
              },
              {
                kind: 'tm',
                name: 'member-goran', // changed
              },
            ],
          },
          {
            kind: 'tc',
            name: 'ognen',
          },
        ],
      })
    )
  })

  test('editAt()', () => {
    const root = createElementZipper()
    const f = e => e.set('name', 'Filip')
    const z = zip.down(zip.down(root))

    const zEdited = zip.editAt(
      R.pipe(
        zip.down,
        zip.down,
        zip.right
      ),
      f,
      z
    )

    expect(
      zip.root(zEdited).getIn(['children', 0, 'children', 1, 'name'])
    ).toEqual('Filip')

    expect(() => {
      zip.editAt(zip.up, f, z) // not allowed
    }).toThrow()

    expect(() => {
      zip.editAt(zip.left, f, z) // not allowed
    }).toThrow()

    expect(() => {
      zip.editAt(zip.right, f, z) // not allowed
    }).toThrow()

    expect(() => {
      zip.editAt(zip.right, f, z) // not allowed
    }).toThrow()

    expect(() => {
      zip.editAt(
        R.pipe(
          zip.down,
          zip.right
        ),
        f,
        z
      ) // not allowed
    }).toThrow()
  })
})
