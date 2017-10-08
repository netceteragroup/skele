'use strict'

import { makeZipper } from '../vendor/zippa'
import { Iterable, List, Map } from 'immutable'
import { curry } from 'ramda'
import {
  isOfKind,
  asList,
  childPositions as childPositionsFromElement,
} from '../data'

const childPositions = curry((defaultChildPositions, el) => {
  const fromEl = childPositionsFromElement(el)
  return !fromEl.isEmpty() ? fromEl : asList(defaultChildPositions)
})

const isBranch = curry((defaultChildPositions, element) => {
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
})

const getChildren = curry((defaultChildPositions, element) => {
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
})

const makeChildCollection = (p, children) =>
  Map({
    kind: '@@girders-elements/child-collection',
    propertyName: p,
    isSingle: !Iterable.isIndexed(children),
    children: asList(children),
  })

const makeNode = curry((defaultChildPositions, element, children) => {
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
})

const singleChild = childColl =>
  childColl.get('isSingle') && childColl.get('children').count() === 1

/**
 * Creates an element zipper with the specified config
 * The function is hard-curried: (config) => (tree) => rootLocation
 *
 * @param config, configuration for the object, currently supports
 * only the `defaultChildPositions` property
 */
export default function elementZipper(config) {
  const { defaultChildPositions } = config
  const dcp = asList(defaultChildPositions)

  const ElementZipperType = makeZipper(
    isBranch(dcp),
    getChildren(dcp),
    makeNode(dcp)
  )

  return ElementZipperType.from.bind(ElementZipperType)
}
