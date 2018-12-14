'use strict'

import { fromJS } from 'immutable'
import * as zip from '..'

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
            kind: 'tm',
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

  it('can be done using conditions (zip.editCond)', () => {
    // given
    const elementZipper = createElementZipper()

    // when
    const result = zip.editCond(
      [
        [
          item => item.get('name') === 'andon',
          item => item.set('name', 'sikavica'),
        ],
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
                kind: 'tm',
                name: 'member-blagoja', // changed
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
})
