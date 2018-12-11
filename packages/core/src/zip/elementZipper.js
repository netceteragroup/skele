'use strict'

import { makeZipper } from '../zip'
import { Iterable, List, Map } from 'immutable'
import * as R from 'ramda'
import {
  isOfKind,
  asList,
  childPositions as childPositionsFromElement,
} from '../data'

const childPositions = R.curry((defaultChildPositions, el) => {
  const fromEl = childPositionsFromElement(el)
  return !fromEl.isEmpty() ? fromEl : asList(defaultChildPositions)
})

const isBranch = R.curry((defaultChildPositions, element) => {
  if (isOfKind('@@skele/child-collection', element)) {
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

const getChildren = R.curry((defaultChildPositions, element) => {
  if (isOfKind('@@skele/child-collection', element)) {
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
    kind: '@@skele/child-collection',
    propertyName: p,
    isSingle: !Iterable.isIndexed(children),
    children: asList(children),
  })

const makeNode = R.curry((defaultChildPositions, element, children) => {
  if (isOfKind('@@skele/child-collection', element)) {
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
 * @param config, configuration for the object, currently cupports o
 *  only the `defaultChildPositions` proprty
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
