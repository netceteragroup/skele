import { makeZipper } from 'zippa';
import { Iterable, List } from 'immutable'

class ImmutableZipper {

  childrenElements
  zipper

  isBranch(element) {
    return !!element.get(this.childrenElements)
  }

  getChildren(element) {
    const elementChildren = element.get(this.childrenElements)
    if (Iterable.isIndexed(elementChildren)) {
      return elementChildren.toArray()
    } else if (Iterable.isAssociative(elementChildren)) {
      return Array.of(elementChildren)
    }
  }

  makeNode(element, children) {
    const newChildren = children.length > 1 ? List(children) : children[0]
    return element.set(this.childrenElements, newChildren)
  }

  constructor(data, childrenElements) {
    this.childrenElements = childrenElements
    const ImmutableZipperType =
      makeZipper( this.isBranch.bind(this),
                  this.getChildren.bind(this),
                  this.makeNode.bind(this))
    this.zipper = ImmutableZipperType.from(data)
  }
}

export default ImmutableZipper