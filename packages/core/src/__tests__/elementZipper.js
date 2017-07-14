'use strict';

import { fromJS } from 'immutable';
import { zip } from '..';

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
    expect(zipper.down().value().size).toEqual(1) // the children collection level
    expect(zipper.down().down().value().get('kind')).toEqual('lvl1')
    expect(zipper.down().down().down().value().size).toEqual(1) // the children collection level
    expect(zipper.down().down().down().down().value().get('kind')).toEqual('lvl2')
    expect(zipper.down().down().down().down().down()).toBeNull()
    expect(zipper.down().up().value().get('kind')).toEqual('parent')
    expect(zipper.down().down().down().up().value().get('kind')).toEqual('lvl1')
  });

  const multipleChildren = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 3
          },
          {
            id: 4
          }
        ]
      },
      {
        id: 5,
        children: [
          {
            id: 6
          },
          {
            id: 7
          }
        ]
      },
      {
        id: 8,
        children: [
          {
            id: 9
          },
          {
            id: 10
          }
        ]
      }
    ]
  }

  it('zipper should correctly navigate up down left and right', () => {
    const zipper = zip.elementZipper(fromJS(multipleChildren), 'children')

    expect(zipper.value().get('id')).toEqual(1)
    expect(zipper.down().value().size).toEqual(3) // children collection level
    expect(zipper.down().down().value().get('id')).toEqual(2)
    expect(zipper.down().down().right().value().get('id')).toEqual(5)
    expect(zipper.down().down().right().right().value().get('id')).toEqual(8)
    expect(zipper.down().down().right().right().left().value().get('id')).toEqual(5)
    expect(zipper.down().down().right().right().left().up().value().size).toEqual(3)
    expect(zipper.down().down().right().right().left().up().up().value().get('id')).toEqual(1)
  });

  const multipleChildrenElements = {
    id: 1,
    left: [
      {
        id: 2
      }
    ],
    right: [
      {
        id: 3
      },
      {
        id: 4
      }
    ]
  }

  it('zipper multiple children elements', () => {
    const zipper = zip.elementZipper(fromJS(multipleChildrenElements), ['left', 'right'])

    expect(zipper.value().get('id')).toEqual(1)
    expect(zipper.down().value().size).toEqual(1) // children collection node for left
    expect(zipper.down().right().value().size).toEqual(2) // children collection node for right
    expect(zipper.down().down().value().get('id')).toEqual(2)
    expect(zipper.down().right().down().value().get('id')).toEqual(3)
    expect(zipper.down().right().down().right().value().get('id')).toEqual(4)
  });
});
