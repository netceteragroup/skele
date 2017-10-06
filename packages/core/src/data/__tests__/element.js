'use strict'

import { List, Seq, fromJS } from 'immutable'
import {
  isOfKind,
  isExactlyOfKind,
  kindOf,
  ancestorKinds,
  canonical,
  isElement,
  childrenProperty,
  childPositions,
  pathsToChildElements,
} from '../element'

describe('element', function() {
  it('tests if an object is an element', () => {
    const emptyKind = fromJS({
      kind: [],
    })
    const stringKind = fromJS({
      kind: 'component',
    })
    const singleKind = fromJS({
      kind: ['component'],
    })
    const doubleKind = fromJS({
      kind: ['component', 'test'],
    })

    const noKind = fromJS({
      title: 'bla',
    })
    const aList = List.of(stringKind, singleKind, doubleKind, emptyKind)

    expect(isElement(emptyKind)).toBeTruthy()
    expect(isElement(stringKind)).toBeTruthy()
    expect(isElement(singleKind)).toBeTruthy()
    expect(isElement(doubleKind)).toBeTruthy()

    expect(isElement(noKind)).toEqual(false)
    expect(isElement(aList)).toEqual(false)
  })

  it('properly checks for element kinds', function() {
    const emptyKind = fromJS({
      kind: [],
    })
    const stringKind = fromJS({
      kind: 'component',
    })
    const singleKind = fromJS({
      kind: ['component'],
    })
    const doubleKind = fromJS({
      kind: ['component', 'test'],
    })
    const tripleKind = fromJS({
      kind: ['component', 'test', 'detail'],
    })

    expect(isOfKind('component', stringKind)).toEqual(true)

    // function is curried
    expect(isOfKind('component')(stringKind)).toEqual(true)

    expect(isOfKind(['component'], stringKind)).toEqual(true)
    expect(isOfKind([], singleKind)).toEqual(true)
    expect(isOfKind(['component'], singleKind)).toEqual(true)
    expect(isOfKind(['component'], doubleKind)).toEqual(true)
    expect(isOfKind(['component', 'test'], doubleKind)).toEqual(true)
    expect(isOfKind(['component'], tripleKind)).toEqual(true)
    expect(isOfKind(['component', 'test'], tripleKind)).toEqual(true)
    expect(isOfKind(['component', 'test', 'detail'], tripleKind)).toEqual(true)

    expect(isOfKind('component', null)).toEqual(false)
    expect(isOfKind('component', emptyKind)).toEqual(false)
    expect(isOfKind('', emptyKind)).toEqual(false)
    expect(isOfKind(['unknown'], stringKind)).toEqual(false)
    expect(isOfKind(['component', 'test'], singleKind)).toEqual(false)
    expect(isOfKind(['test'], doubleKind)).toEqual(false)
    expect(isOfKind(['component', 'test', 'detail'], doubleKind)).toEqual(false)
    expect(isOfKind(['detail'], tripleKind)).toEqual(false)
    expect(
      isOfKind(['component', 'test', 'detail', 'unknown'], tripleKind)
    ).toEqual(false)
  })

  it('properly checks for exact element kinds', function() {
    const element = fromJS({
      kind: ['component', 'test'],
    })

    expect(isExactlyOfKind(null, null)).toEqual(false)
    expect(isExactlyOfKind(['component'], element)).toEqual(false)
    expect(isExactlyOfKind(['component', 'test'], element)).toEqual(true)
    // curried
    expect(isExactlyOfKind(['component', 'test'])(element)).toEqual(true)
  })

  it('returns the element kind', function() {
    const kind = ['component', 'test']
    const element1 = fromJS({
      kind: null,
    })
    const element2 = fromJS({
      kind: kind,
    })

    expect(kindOf(element1)).toEqual(null)
    expect(kindOf(element2)).toEqual(List(kind))
  })

  it('returns the ancestor kinds', function() {
    const kinds = ['component', 'test', 'detail']
    const ancestors = [
      ['component', 'test', 'detail'],
      ['component', 'test'],
      ['component'],
    ]

    expect(ancestorKinds([]).toJS()).toEqual([])
    expect(ancestorKinds('component').toJS()).toEqual([['component']])
    expect(ancestorKinds(kinds).toJS()).toEqual(ancestors)
  })

  it('properly normalizes element kinds', function() {
    expect(canonical(null)).toEqual(null)
    expect(canonical(true)).toEqual(null)
    expect(canonical('component')).toEqual(List.of('component'))
    expect(canonical(['component', 'test'])).toEqual(
      List.of('component', 'test')
    )
    expect(canonical(List.of('component', 'test'))).toEqual(
      List.of('component', 'test')
    )
    expect(canonical(Seq.of('component'))).toEqual(List.of('component'))
  })
})

describe('childPositions', () => {
  const aString = fromJS({
    kind: 'component',
    [childrenProperty]: 'children',
  })

  const anArray = fromJS({
    kind: 'component',
    [childrenProperty]: ['children'],
  })

  const multiple = fromJS({
    kind: 'component',
    [childrenProperty]: ['children', 'aside'],
  })

  const missing = fromJS({
    kind: 'component',
  })

  expect(childPositions(aString)).toEqualI(List.of('children'))
  expect(childPositions(anArray)).toEqualI(List.of('children'))
  expect(childPositions(multiple)).toEqualI(List.of('children', 'aside'))
  expect(childPositions(missing)).toEqualI(List())
})

describe('pathsToChildElements', () => {
  const aStringWithSingleChild = fromJS({
    kind: 'component',
    [childrenProperty]: 'children',

    children: {
      kind: 'child',
    },
  })

  const anArrayWithSingleChild = fromJS({
    kind: 'component',
    [childrenProperty]: ['children'],

    children: {
      kind: 'child',
    },
  })

  const aStringWithChildrenArray = fromJS({
    kind: 'component',
    [childrenProperty]: 'children',

    children: [
      {
        kind: 'child',
      },
    ],
  })

  const anArrayWithChildrenArray = fromJS({
    kind: 'component',
    [childrenProperty]: ['children'],

    children: [
      {
        kind: 'child',
      },
    ],
  })
  ;[
    (aStringWithSingleChild,
    anArrayWithChildrenArray,
    anArrayWithSingleChild,
    aStringWithChildrenArray),
  ].forEach(el => {
    expect(kindOf(el.getIn(pathsToChildElements(el).first()))).toEqualI(
      List.of('child')
    )
  })
})
