import { makeZipper } from 'zippa';

function isBranch(element) {
  return !!element.get('content')
}

function getChildren(element) {
  // NOTE: why is toArray needed? check how the zipper moves are implemted and can/should the be overriden
  return element.get('content').toArray()
}

function makeNode(element, children) {
  return element.set('content', children)
}

const TreeZipper = makeZipper(isBranch, getChildren, makeNode)

export default TreeZipper