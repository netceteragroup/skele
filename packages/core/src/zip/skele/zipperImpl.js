'use strict'

import { zipper } from '../../zip'
import { Iterable, List, Map } from 'immutable'
import { isOfKind, asList, childPositions } from '../../data'

const isBranch = element => {
  if (isOfKind('@@skele/child-collection', element)) {
    return true
  }

  const positions = childPositions(element)

  return positions != null && !positions.isEmpty()
}

const getChildren = element => {
  if (isOfKind('@@skele/child-collection', element)) {
    return element.get('children').toArray()
  }
  // at a children collection level
  const positions = childPositions(element)

  const children = positions
    .reduce(
      (children, p) =>
        element.get(p)
          ? children.push(makeChildCollection(p, element.get(p)))
          : children,
      List()
    )
    .toArray()

  return children
}

const makeChildCollection = (p, children) =>
  Map({
    kind: '@@skele/child-collection',
    propertyName: p,
    isSingle: !Iterable.isIndexed(children),
    children: asList(children),
  })

const makeNode = (element, children) => {
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
}

const singleChild = childColl =>
  childColl.get('isSingle') && childColl.get('children').count() === 1

/**
 * Creates a zipper over a Skele state tree.
 *
 * @param root the root node of the state tree
 */
export default zipper.bind(undefined, isBranch, getChildren, makeNode)
