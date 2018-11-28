'use strict'

export {
  whilst,
  value,
  zipperFrom,
  isBranch,
  isLeaf,
  getChildren,
  isEnd,
  isTop,
  isNotTop,
  isLeftmost,
  isRightmost,
  canGoLeft,
  canGoRight,
  leftmost,
  left,
  rightmost,
  canGoDown,
  canGoUp,
  up,
  root,
  next,
  prev,
  remove,
  makeZipper,
  insertLeft,
  insertRight,
  insertChild,
  appendChild,
  edit,
  replace,
  makeItem,
} from '../vendor/zippa'

export { default as elementZipper } from './elementZipper'
export * from './reduce'
export * from './edit'
export * from './walk'
export * from './zipper'
