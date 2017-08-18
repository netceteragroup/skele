'use strict';

import { fromJS } from 'immutable'
import { zip, data } from '..'
import { canGoDown } from 'zippa'

const childCollectionKind = '@@girders-elements/child-collection'

describe('Zipper', () => {

  const singleChild = {
    kind: 'parent',
    children: [
      {
        kind: 'lvl1',
        children: [
          {
            kind: 'lvl2'
          }
        ]
      }
    ]
  }

  it('zipper should correctly navigate up and down', () => {
    const zipper = zip.elementZipper(fromJS(singleChild), 'children')
    expect(zipper.value().get('kind')).toEqual('parent')
    expect(data.isOfKind(childCollectionKind, zipper.down().value())).toBe(true)
    expect(zipper.down().down().value().get('kind')).toEqual('lvl1')
    expect(data.isOfKind(childCollectionKind, zipper.down().down().down().value())).toBe(true)
    expect(zipper.down().down().down().down().value().get('kind')).toEqual('lvl2')
    expect(zipper.down().down().down().down().down()).toBeNull()
    expect(zipper.down().up().value().get('kind')).toEqual('parent')
    expect(zipper.down().down().down().up().value().get('kind')).toEqual('lvl1')
  });

  const multipleChildren = {
    id: 1,
    kind: "t",
    children: [
      {
        id: 2,
        kind: "t",
        children: [
          {
            id: 3,
            kind: "t"
          },
          {
            kind: "t",
            id: 4
          }
        ]
      },
      {
        id: 5,
        kind: "t",
        children: [
          {
            kind: "t",
            id: 6
          },
          {
            kind: "t",
            id: 7
          }
        ]
      },
      {
        id: 8,
        kind: "t",
        children: [
          {
            kind: "t",
            id: 9
          },
          {
            kind: "t",
            id: 10
          }
        ]
      }
    ]
  }

  it('zipper should correctly navigate up down left and right', () => {
    const zipper = zip.elementZipper(fromJS(multipleChildren), 'children')

    expect(zipper.value().get('id')).toEqual(1)
    expect(data.isOfKind(childCollectionKind, zipper.down().value())).toBe(true)
    expect(zipper.down().down().value().get('id')).toEqual(2)
    expect(zipper.down().down().right().value().get('id')).toEqual(5)
    expect(zipper.down().down().right().right().value().get('id')).toEqual(8)
    expect(zipper.down().down().right().right().left().value().get('id')).toEqual(5)
    expect(data.isOfKind(childCollectionKind, zipper.down().down().right().right().left().up().value())).toBe(true)
    expect(zipper.down().down().right().right().left().up().up().value().get('id')).toEqual(1)
  });

  const multipleChildrenElements = {
    id: 1,
    kind: "t",
    left: [
      {
        kind: "t",
        id: 2
      }
    ],
    right: [
      {
        kind: "t",
        id: 3
      },
      {
        kind: "t",
        id: 4
      }
    ]
  }

  it('zipper multiple children elements', () => {
    const zipper = zip.elementZipper(fromJS(multipleChildrenElements), ['left', 'right'])

    expect(zipper.value().get('id')).toEqual(1)
    console.log(zipper.canGoDown(zipper))
    expect(zipper.down().value().get('propertyName')).toEqual('left')

    expect(zipper.down().right().value().get('propertyName')).toEqual('right')

    expect(zipper.down().down().value().get('id')).toEqual(2)
    expect(zipper.down().right().down().value().get('id')).toEqual(3)
    expect(zipper.down().right().down().right().value().get('id')).toEqual(4)
  });

  const withChildrenPositions = {
    id: 1,
    kind: "tX",
    "@@girders-elements/children": ['left', 'right'],

    left: [
      {
        kind: "t",
        id: 2
      }
    ],
    right: [
      {
        kind: "t",
        id: 3
      },
      {
        kind: "t",
        id: 4
      }
    ]
  }


  it('supports the @@girders-elements/children hint for child positions', () => {
    const zipper = zip.elementZipper(fromJS(withChildrenPositions))

    expect(zipper.value().get('id')).toEqual(1)
    console.log(zipper.canGoDown(zipper))
    expect(zipper.down().value().get('propertyName')).toEqual('left')

    expect(zipper.down().right().value().get('propertyName')).toEqual('right')

    expect(zipper.down().down().value().get('id')).toEqual(2)
    expect(zipper.down().right().down().value().get('id')).toEqual(3)
    expect(zipper.down().right().down().right().value().get('id')).toEqual(4)
  });
});
