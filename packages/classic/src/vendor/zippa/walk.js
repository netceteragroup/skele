// @flow
import curry from 'ramda/src/curry';
import { visit, onPre, onPost } from './visit';

const makeStatelessVisitor = fn => (item, _) => ({ item: fn(item) });

/**
 * Walks the data structure in depth-first order, applying
 * the function after the item's subtree has been walked.
 *
 * Returns a new data structure of modified items, or the original
 * zipper if the structure wasn't modified.
 *
 * @param  {Function} fn - function applied to each item after it's subtree was walked
 * @param  {Zipper} zipper - A Zipper value to walk
 * @return {Zipper}
 */
export const postWalk = curry((fn, zipper) =>
    visit(
        [
            onPost(makeStatelessVisitor(fn)),
        ],
        undefined,
        zipper,
    ).zipper
);

/**
 * Walks the data structure in depth-first order, applying
 * the function before the item's subtree has been walked.
 *
 * Returns a new data structure of modified items, or the original
 * zipper if the structure wasn't modified.
 *
 * @param  {Function} fn - function applied to each item before it's subtree is walked
 * @param  {Zipper} zipper - A Zipper value to walk
 * @return {Zipper}
 */
export const preWalk = curry((fn, zipper) =>
    visit(
        [
            onPre(makeStatelessVisitor(fn)),
        ],
        undefined,
        zipper,
    ).zipper
);


/**
 * Walks the data structure in depth-first order,
 * applying inner and outer functions before and after (respectively) each
 * item's subtree is walked.
 *
 * Returns a new data structure from modified items, or the original
 * zipper if the structure wasn't modified.
 *
 * @param  {Function} inner - function applied to each item before it's subtree is walked
 * @param  {Function} outer  function applied to each item after it's subtree was walked
 * @param  {Zipper} zipper - A Zipper value to walk
 * @return {Zipper}
 */
export const walk = curry((innerFn, outerFn, zipper) =>
    visit(
        [
            onPre(makeStatelessVisitor(innerFn)),
            onPost(makeStatelessVisitor(outerFn)),
        ],
        undefined,
        zipper,
    ).zipper
);

export default {
    walk,
    postWalk,
    preWalk,
};
