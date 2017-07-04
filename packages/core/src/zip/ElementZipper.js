import { makeZipper } from 'zippa';
import { Iterable, List } from 'immutable'
import { curry } from 'ramda'

function isBranch(childrenElements, element) {
  return Iterable.isIndexed(element) || !!element.get(childrenElements)
}

function getChildren(childrenElements, element) {
  // at a children collection level
  if (Iterable.isIndexed(element)) {
    return element.toArray()
  } else if (Iterable.isAssociative(element)) {
    // at node level
    const elementChildren = element.get(childrenElements)
    return Array.of(elementChildren)
  }
}

function makeNode(childrenElements, element, children) {
  if (Iterable.isIndexed(element)) {
    return List(children)
  } else {
    const newChildren = children.length > 1 ? List(children) : children[0]
    return element.set(childrenElements, newChildren)
  }
}

export default function elementZipper(data, childrenElements) {
  const ElementZipperType = makeZipper(
      curry(isBranch)(childrenElements),
      curry(getChildren)(childrenElements),
      curry(makeNode)(childrenElements))
  return ElementZipperType.from(data)
}