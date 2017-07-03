import { makeZipper } from 'zippa';
import { Iterable, List } from 'immutable'
import { curry } from 'ramda'

function isBranch(childrenElements, element) {
  return !!element.get(childrenElements)
}

function getChildren(childrenElements, element) {
  const elementChildren = element.get(childrenElements)
  if (Iterable.isIndexed(elementChildren)) {
    return elementChildren.toArray()
  } else if (Iterable.isAssociative(elementChildren)) {
    return Array.of(elementChildren)
  }
}

function makeNode(childrenElements, element, children) {
  const newChildren = children.length > 1 ? List(children) : children[0]
  return element.set(childrenElements, newChildren)
}

export default function elementZipper(data, childrenElements) {
  const ElementZipperType = makeZipper(
      curry(isBranch)(childrenElements),
      curry(getChildren)(childrenElements),
      curry(makeNode)(childrenElements))
  return ElementZipperType.from(data)
}