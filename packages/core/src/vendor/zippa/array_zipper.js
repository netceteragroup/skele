import { makeZipper } from './zipper';

/**
 * Zipper for nested Arrays.
 *
 * Don't use with new keyword - use the function plainly
 * or with `ArrayZipper.from([1, 2, 3])`.
 *
 * @param  {Array} arr - the data structure to make a zipper for
 * @return {Zipper}
 */
export const ArrayZipper = makeZipper(
    arr => !!arr.length,
    arr => arr,
    (_, children) => children,
);

export default ArrayZipper;
