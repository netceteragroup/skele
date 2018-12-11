'use strict'

import { fromJS, List } from 'immutable'
import * as zip from '..'
import * as data from '../../data'

describe.skip('Reducing a Zipper', () => {
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
  const organizationElement = fromJS(organization)

  it('can be done in post-order fashion', () => {
    // given
    const elementZipper = zip.elementZipper({
      defaultChildPositions: 'children',
    })(organizationElement)

    // when
    const result = zip.reduce(
      (acc, item) => (item.get('name') ? acc.push(item.get('name')) : acc),
      List(),
      elementZipper
    )

    // then
    expect(result).toEqualI(
      List.of(
        'emilija',
        'filip',
        'zdravko',
        'blagoja',
        'goran',
        'andon',
        'ognen',
        'alex'
      )
    )
  })

  it('can be done in pre-order fashion', () => {
    // given
    const elementZipper = zip.elementZipper({
      defaultChildPositions: 'children',
    })(organizationElement)

    // when
    const result = zip.reducePre(
      (acc, item) => (item.get('name') ? acc.push(item.get('name')) : acc),
      List(),
      elementZipper
    )

    // then
    expect(result).toEqualI(
      List.of(
        'alex',
        'zdravko',
        'emilija',
        'filip',
        'andon',
        'blagoja',
        'goran',
        'ognen'
      )
    )
  })

  it('can be done using a predicate', () => {
    // given
    const elementZipper = zip.elementZipper({
      defaultChildPositions: 'children',
    })(organizationElement)

    // when
    const result = zip.reduce(
      data.when(
        item => item.get('kind') === 'tm',
        (acc, item) => acc.push(item.get('name'))
      ),
      List(),
      elementZipper
    )

    // then
    expect(result).toEqualI(List.of('emilija', 'filip', 'blagoja', 'goran'))
  })
})
