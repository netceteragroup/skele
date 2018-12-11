'use strict'

export {
  whilst,
  zipperFrom,
  isBranch,
  isLeaf,
  isEnd,
  isTop,
  isNotTop,
  isLeftmost,
  isRightmost,
  canGoLeft,
  leftmost,
  left,
  rightmost,
  canGoUp,
  root,
  next,
  prev,
  remove,
  insertLeft,
  insertRight,
  insertChild,
  appendChild,
  replace,
  makeItem,
} from '../vendor/zippa'

export { default as elementZipper } from './elementZipper'
export * from './reduce'
export * from './edit'
export * from './walk'
export * from './zipper'
