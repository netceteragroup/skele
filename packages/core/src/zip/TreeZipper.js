import { makeZipper } from 'zippa';
import { Iterable, List } from 'immutable'

// TODO: This value should be configurable
const childrenKey = 'content'

function isBranch(element) {
  return !!element.get(childrenKey)
}

function getChildren(element) {

  // TODO: should we make zippa work with immutable lists, so that we don't have to convert to JS array with .toArray?
  const elementChildren = element.get(childrenKey)
  if (Iterable.isIndexed(elementChildren)) {
    return elementChildren.toArray()
  } else if (Iterable.isAssociative(elementChildren)) {
    return Array.of(elementChildren)
  }
}

function makeNode(element, children) {
  const newChildren = children.length > 1 ? List(children) : children[0]
  return element.set(childrenKey, newChildren)
}

const TreeZipper = makeZipper(isBranch, getChildren, makeNode)

export default TreeZipper