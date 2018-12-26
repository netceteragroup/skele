'use strict'

import R from 'ramda'
import { fromJS } from 'immutable'
import * as zip from '../..'
import skeleZip from '..'
import * as data from '../../../data'
import * as propNames from '../../../propNames'

const childCollectionKind = '@@skele/child-collection'

describe('Skele Zipper', () => {
  const singleChild = {
    kind: 'parent',
    [propNames.children]: 'children',
    children: [
      {
        kind: 'lvl1',
        [propNames.children]: 'children',
        children: [
          {
            kind: 'lvl2',
          },
        ],
      },
    ],
  }

  it('zipper should correctly navigate up and down', () => {
    const zipper = skeleZip(fromJS(singleChild))

    expect(zip.node(zipper).get('kind')).toEqual('parent')
    expect(data.isOfKind(childCollectionKind, zip.node(zip.down(zipper)))).toBe(
      true
    )
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.node
      )(zipper).get('kind')
    ).toEqual('lvl1')

    expect(
      data.isOfKind(
        childCollectionKind,

        R.pipe(
          zip.down,
          zip.down,
          zip.down,
          zip.node
        )(zipper)
      )
    ).toBe(true)
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.down,
        zip.down,
        zip.node
      )(zipper).get('kind')
    ).toEqual('lvl2')
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.down,
        zip.down,
        zip.down
      )(zipper)
    ).toBeNull()
    expect(
      R.pipe(
        zip.down,
        zip.up,
        zip.node
      )(zipper).get('kind')
    ).toEqual('parent')
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.down,
        zip.up,
        zip.node
      )(zipper).get('kind')
    ).toEqual('lvl1')
  })

  const multipleChildren = {
    id: 1,
    kind: 't',
    [propNames.children]: 'children',
    children: [
      {
        id: 2,
        kind: 't',
        [propNames.children]: 'children',
        children: [
          {
            id: 3,
            kind: 't',
          },
          {
            kind: 't',
            id: 4,
          },
        ],
      },
      {
        id: 5,
        kind: 't',
        [propNames.children]: 'children',
        children: [
          {
            kind: 't',
            id: 6,
          },
          {
            kind: 't',
            id: 7,
          },
        ],
      },
      {
        id: 8,
        kind: 't',
        [propNames.children]: 'children',
        children: [
          {
            kind: 't',
            id: 9,
          },
          {
            kind: 't',
            id: 10,
          },
        ],
      },
    ],
  }

  it('zipper should correctly navigate up down left and right', () => {
    const zipper = skeleZip(fromJS(multipleChildren))

    expect(zip.node(zipper).get('id')).toEqual(1)
    expect(data.isOfKind(childCollectionKind, zip.node(zip.down(zipper)))).toBe(
      true
    )
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.node
      )(zipper).get('id')
    ).toEqual(2)
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.right,
        zip.node
      )(zipper).get('id')
    ).toEqual(5)
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.right,
        zip.right,
        zip.node
      )(zipper).get('id')
    ).toEqual(8)
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.right,
        zip.right,
        zip.left,
        zip.node
      )(zipper).get('id')
    ).toEqual(5)
    expect(
      data.isOfKind(
        childCollectionKind,
        R.pipe(
          zip.down,
          zip.down,
          zip.right,
          zip.right,
          zip.left,
          zip.up,
          zip.node
        )(zipper)
      )
    ).toBe(true)
    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.right,
        zip.right,
        zip.left,
        zip.up,
        zip.up,
        zip.node
      )(zipper).get('id')
    ).toEqual(1)
  })

  const multipleChildrenElements = {
    id: 1,
    kind: 't',
    [propNames.children]: ['left', 'right'],
    left: [
      {
        kind: 't',
        id: 2,
      },
    ],
    right: [
      {
        kind: 't',
        id: 3,
      },
      {
        kind: 't',
        id: 4,
      },
    ],
  }

  it('zipper multiple children elements', () => {
    const zipper = skeleZip(fromJS(multipleChildrenElements))

    expect(zip.node(zipper).get('id')).toEqual(1)
    expect(
      R.pipe(
        zip.down,
        zip.node
      )(zipper).get('propertyName')
    ).toEqual('left')

    expect(
      R.pipe(
        zip.down,
        zip.right,
        zip.node
      )(zipper).get('propertyName')
    ).toEqual('right')

    expect(
      R.pipe(
        zip.down,
        zip.down,
        zip.node
      )(zipper).get('id')
    ).toEqual(2)
    expect(
      R.pipe(
        zip.down,
        zip.right,
        zip.down,
        zip.node
      )(zipper).get('id')
    ).toEqual(3)
    expect(
      R.pipe(
        zip.down,
        zip.right,
        zip.down,
        zip.right,
        zip.node
      )(zipper).get('id')
    ).toEqual(4)
  })
})
