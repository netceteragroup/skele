'use strict'

import { makeZipper } from '../vendor/zippa'
import { Iterable, List, Map } from 'immutable'
import { curry } from 'ramda'
import { isOfKind } from '../data'

// eslint-disable-next-line no-nested-ternary
const asList = v =>
  Iterable.isIndexed(v)
    ? v
    : Array.isArray(v) ? List(v) : v ? List.of(v) : List()
const childPositions = (defaultPositions, el) =>
  asList(el.get('@@girders-elements/children') || defaultPositions)

const isBranch = (defaultChildPositions, element) => {
  if (isOfKind('@@girders-elements/child-collection', element)) {
    const children = element.get('children')
    return children && children.count() > 0
  }
  const positions = childPositions(defaultChildPositions, element)
  // console.log(
  //   'Child positions for: ',
  //   element.get('kind'),
  //   ' == ',
  //   positions.toJS()
  // )
  return positions.some(pos => element.get(pos))
}

const getChildren = (defaultChildPositions, element) => {
  if (isOfKind('@@girders-elements/child-collection', element)) {
    return element.get('children').toArray()
  }
  // at a children collection level
  const positions = childPositions(defaultChildPositions, element)

  return positions
    .reduce(
      (children, p) =>
        element.get(p)
          ? children.push(makeChildCollection(p, element.get(p)))
          : children,
      List()
    )
    .toArray()
}

const makeChildCollection = (p, children) =>
  Map({
    kind: '@@girders-elements/child-collection',
    propertyName: p,
    isSingle: !Iterable.isIndexed(children),
    children: asList(children),
  })

const makeNode = (defaultChildPositions, element, children) => {
  if (isOfKind('@@girders-elements/child-collection', element)) {
    return element.set('children', List(children))
  }
  return children.reduce(
    (el, childColl) =>
      el.set(
        childColl.get('propertyName'),
        singleChild(childColl)
          ? childColl.getIn(['children', 0])
          : childColl.get('children')
      ),
    element
  )
}

const singleChild = childColl =>
  childColl.get('isSingle') && childColl.get('children').count() === 1

export default function elementZipper(data, defaultChildPositions) {
  const dcp = asList(defaultChildPositions)

  const ElementZipperType = makeZipper(
    curry(isBranch)(dcp),
    curry(getChildren)(dcp),
    curry(makeNode)(dcp)
  )
  return ElementZipperType.from(data)
}
