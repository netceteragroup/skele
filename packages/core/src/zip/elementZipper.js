import { makeZipper } from 'zippa';
import { Iterable, List } from 'immutable'
import { curry } from 'ramda'

function isBranch(childrenElements, element) {

  // this is a safety check for the case when some of the children elements also matches a field with a scalar value
  if (!Iterable.isIndexed(element) && !Iterable.isAssociative(element)) {
    return false
  }

  let isBranch = Iterable.isIndexed(element)
  if (childrenElements instanceof Array) {
    childrenElements.forEach(childElement => isBranch = isBranch || !!element.get(childElement))
  } else {
    isBranch = isBranch || !!element.get(childrenElements)
  }
  return isBranch
}

function getChildren(childrenElements, element) {
  // at a children collection level
  if (Iterable.isIndexed(element)) {
    return element.toArray()
  } else if (Iterable.isAssociative(element)) {
    // at node level
    if (childrenElements instanceof Array) {
      // multiple children elements
      return childrenElements.map(childElement => element.get(childElement)).filter(e => !!e)
    } else {
      // single child element
      return Array.of(element.get(childrenElements))
    }
  }
}

function makeNode(childrenElements, element, children) {
  // at a children collection level
  if (Iterable.isIndexed(element)) {
    return List(children)
  } else {
    // at node level
    if (childrenElements instanceof Array) {
      // multiple children elements
      let newElement = element
      let count = 0
      childrenElements.map(childElement => {
        if (element.get(childElement))
          newElement = newElement.set(childElement, children[count++])
      })
      return newElement
    } else {
      // single child element
      const newChildren = children.length > 1 ? List(children) : children[0]
      return element.set(childrenElements, newChildren)
    }
  }
}

export default function elementZipper(data, childrenElements) {
  const ElementZipperType = makeZipper(
      curry(isBranch)(childrenElements),
      curry(getChildren)(childrenElements),
      curry(makeNode)(childrenElements))
  return ElementZipperType.from(data)
}