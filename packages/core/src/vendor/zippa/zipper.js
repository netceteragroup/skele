import __ from 'ramda/src/__';
import assoc from 'ramda/src/assoc';
import arrOf from 'ramda/src/of';
import always from 'ramda/src/always';
import call from 'ramda/src/call';
import cond from 'ramda/src/cond';
import converge from 'ramda/src/converge';
import complement from 'ramda/src/complement';
import curry from 'ramda/src/curry';
import either from 'ramda/src/either';
import head from 'ramda/src/head';
import equals from 'ramda/src/equals';
import identity from 'ramda/src/identity';
import init from 'ramda/src/init';
import ifElse from 'ramda/src/ifElse';
import last from 'ramda/src/last';
import or from 'ramda/src/or';
import prop from 'ramda/src/prop';
import juxt from 'ramda/src/juxt';
import tail from 'ramda/src/tail';
import pipe from 'ramda/src/pipe';
import merge from 'ramda/src/merge';
import alwaysTrue from 'ramda/src/T';
import when from 'ramda/src/when';
import unless from 'ramda/src/unless';
import until from 'ramda/src/until';
import unnest from 'ramda/src/unnest';

const TOP = null;
const END = 'END';

function isEmpty(arr) {
    return !arr.length;
}

export const whilst = curry((predicate, fn, value) => {
    let curr = value;
    while (predicate(curr)) {
        curr = fn(curr);
    }
    return curr;
});

const TOPPATH = {
    left: [],
    right: [],
    parentItems: TOP,
    parentPath: TOP,
    changed: false,
};

/**
 * The Zipper class.
 *
 * Keeps track of the current item, path, and metadata (implementation functions).
 *
 * Don't use this constructor directly. Create your own Zipper factory with `makeZipper`,
 * and use it to create instances of Zipper.
 *
 * @class Zipper
 * @namespace Zipper
 */
function Zipper(item, path, meta) {
    this.item = item;
    this.path = path;
    this.meta = meta;
}


const getItem = prop('item');

/**
 * Gets the value of the current location.
 * @param {Zipper} zipper
 * @returns {T|null}
 */
export const value = getItem;

const getPath = prop('path');
const getMeta = prop('meta');


const sideEffect = curry((fn, x) => {
    fn(x);
    return x;
});

const _raiser = msg => () => {
    throw new Error(msg);
};

const raise = pipe(_raiser, sideEffect);

export function zipperFrom(oldLoc, newItem, path, meta) {
    return new Zipper(newItem, path || getPath(oldLoc), meta || getMeta(oldLoc));
}

/**
 * Returns a boolean indicating if the current location is not a leaf.
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export function isBranch(zipper) {
    return getMeta(zipper).isBranch(getItem(zipper));
}

/**
 * Returns a boolean indicating if the current location is a leaf.
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const isLeaf = complement(isBranch);

const _getChildrenFn = pipe(getMeta, prop('getChildren'));

export const getChildren = pipe(
    when(isLeaf, raise('Tried getting children of a leaf')),
    converge(call, [_getChildrenFn, getItem]),
);

function makeItem(z, item, children) {
    return getMeta(z).makeItem(item, children);
}

/**
 * Returns a boolean indicating if the zipper has been
 * exhausted by calls to `next`.
 *
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const isEnd = pipe(getPath, equals(END));

const _parentItemsFromPath = prop('parentItems');
const _parent = pipe(_parentItemsFromPath, last);
const _parentPath = prop('parentPath');
const getParentItems = pipe(
    getPath,
    when(equals(END), raise('Can\'t get parent items from end path.')),
    _parentItemsFromPath
);

const getParent = pipe(getPath, _parent);
const getParentPath = pipe(getPath, _parentPath);

/**
 * Returns a boolean indicating if the zipper is at the top.
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const isTop = pipe(getParentItems, equals(TOP));

/**
 * Returns a boolean indicating if the zipper is not at the top.
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const isNotTop = complement(isTop);

const _leftsFromPath = pipe(prop('left'), or(__, []));
const _rightsFromPath = pipe(prop('right'), or(__, []));

const lefts = pipe(getPath, _leftsFromPath);
const rights = pipe(getPath, _rightsFromPath);

const hasChanged = pipe(getPath, prop('changed'), Boolean);
const isUnchanged = complement(hasChanged);
const isNotEmpty = complement(isEmpty);

/**
 * Returns a boolean indicating if the item at the current location
 * is the leftmost sibling.
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const isLeftmost = pipe(lefts, isEmpty);

/**
 * Returns a boolean indicating if the item at the current location
 * is the rightmost sibling.
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const isRightmost = pipe(rights, isEmpty);

/**
 * Returns a boolean indicating if the item at the current location
 * is the leftmost sibling.
 *
 * Alias for {@link isLeftmost}
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const canGoLeft = complement(isLeftmost);

/**
 * Returns a boolean indicating if the item at the current location
 * is the rightmost sibling.
 *
 * Alias for {@link isRightmost}
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const canGoRight = complement(isRightmost);

/**
 * Moves location to the leftmost sibling.
 * If the current location is already the leftmost,
 * returns itself.
 *
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export function leftmost(zipper) {
    if (isTop(zipper) || isLeftmost(zipper)) return zipper;

    const path = getPath(zipper);

    const _lefts = _leftsFromPath(path);
    const _rights = _rightsFromPath(path);

    const item = getItem(zipper);
    const leftMost = head(_lefts);
    const newLeft = [];
    const newRight = tail(_lefts).concat([item], _rights);

    return zipperFrom(
        zipper,
        leftMost,
        merge(path, {
            left: newLeft,
            right: newRight,
        }),
    );
}

/**
 * Moves location to the left sibling.
 * If the current location is already the leftmost,
 * returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */
export function left(zipper) {
    if (isEnd(zipper)) return zipper;
    if (isLeftmost(zipper)) return null;

    const item = getItem(zipper);
    const path = getPath(zipper);

    const _lefts = _leftsFromPath(path);

    const _rights = _rightsFromPath(path);

    const leftSibling = last(_lefts);
    const newLeft = init(_lefts);
    const newRight = [item].concat(_rights);

    return zipperFrom(
        zipper,
        leftSibling,
        merge(path, {
            left: newLeft,
            right: newRight,
        }),
    );
}

/**
 * Moves location to the right sibling.
 * If the current location is already the rightmost,
 * returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */
export function right(zipper) {
    if (isEnd(zipper)) return zipper;
    if (isRightmost(zipper)) return null;

    const item = getItem(zipper);
    const path = getPath(zipper);

    const _lefts = _leftsFromPath(path);
    const _rights = _rightsFromPath(path);
    const rightSibling = head(_rights);
    const newLeft = _lefts.concat([item]);
    const newRight = tail(_rights);

    return zipperFrom(
        zipper,
        rightSibling,
        merge(path, {
            left: newLeft,
            right: newRight,
        }),
    );
}

/**
 * Moves location to the rightmost sibling.
 * If the current location is already the rightmost,
 * returns itself.
 *
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export function rightmost(zipper) {
    if (isRightmost(zipper)) return zipper;

    const path = getPath(zipper);

    const _rights = _rightsFromPath(path);
    const _lefts = _leftsFromPath(path);

    const item = getItem(zipper);
    const rightMost = last(_rights);
    const newLeft = _lefts.concat([item], init(_rights));
    const newRight = [];
    return zipperFrom(
        zipper,
        rightMost,
        merge(path, {
            left: newLeft,
            right: newRight,
        })
    );
}

/**
 * Alias for `isBranch`
 *
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export function canGoDown(ipper) {
    return isBranch(ipper) && isNotEmpty(getChildren(ipper));
}


/**
 * Moves location to the leftmost child.
 * If the current item is a leaf, returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */
export function down(zipper) {
    if (!isBranch(zipper)) return null;

    const item = getItem(zipper);
    const path = getPath(zipper);

    const children = getChildren(zipper);
    const newLeft = [];
    const newRight = tail(children);
    const newLoc = zipperFrom(
        zipper,
        head(children),
        merge(path, {
            left: newLeft,
            right: newRight,
            parentItems: (_parentItemsFromPath(path) || []).concat([item]),
            parentPath: path,
        })
    );
    return newLoc;
}

function _insertLeft(insertItem, zipper) {
    if (isTop(zipper)) {
        throw new Error('Tried inserting left of top');
    }

    const item = getItem(zipper);
    const path = getPath(zipper);

    const _lefts = _leftsFromPath(path);
    return zipperFrom(
        zipper,
        item,
        merge(path, {
            left: _lefts.concat([insertItem]),
            changed: true,
        })
    );
}

function _insertRight(insertItem, zipper) {
    if (isTop(zipper)) {
        throw new Error('Tried inserting left of top');
    }

    const item = getItem(zipper);
    const path = getPath(zipper);
    const _rights = _rightsFromPath(path);

    return zipperFrom(
        zipper,
        item,
        merge(path, {
            right: [insertItem].concat(_rights),
            changed: true,
        })
    );
}

function _replace(_replaceWith, zipper) {
    if (getItem(zipper) === _replaceWith) return zipper;

    return zipperFrom(
        zipper,
        _replaceWith,
        assoc('changed', true, getPath(zipper))
    );
}

function _edit(fn, zipper) {
    return _replace(fn(getItem(zipper)), zipper);
}

/**
 * Returns a boolean indicating if the zipper is not at the top.
 *
 * Alias for {@link isNotTop}
 *
 * @param {Zipper} zipper
 * @returns {boolean}
 */
export const canGoUp = isNotTop;

const _unchangedUp = converge(zipperFrom, [identity, getParent, getParentPath]);

const itemsOnCurrentLevel = pipe(
    juxt([lefts, pipe(getItem, arrOf), rights]),
    unnest
);

const makeParentItem = converge(makeItem, [identity, getParent, itemsOnCurrentLevel]);

/**
 * Moves location to the parent, constructing a new parent
 * if the children have changed.
 *
 * If already at the top, returns null.
 *
 * @param {Zipper} zipper
 * @returns {Zipper|null}
 */
export const up = cond([
    [or(isTop, isEnd), always(null)],
    [isUnchanged, _unchangedUp],
    [alwaysTrue, converge(
        zipperFrom,
        [
            identity,
            makeParentItem,
            pipe(getParentPath, assoc('changed', true)),
        ]
    )],
]);

/**
 * Moves location to the root, constructing
 * any changes made.
 *
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const root = unless(isEnd, whilst(isNotTop, up));

const toEnd = z => zipperFrom(z, getItem(z), END);

const nextUp = pipe(
    until(either(isTop, canGoRight), up),
    ifElse(
        isTop,
        toEnd,
        right,
    )
);

/**
 * Moves location to the next element in depth-first order.
 *
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const next = cond([
    [isEnd, identity],
    [canGoDown, down],
    [canGoRight, right],
    [alwaysTrue, nextUp],
]);

const _goToRightmostChild = pipe(down, rightmost);

/**
 * Moves location to the previous element in depth-first order.
 *
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const prev = ifElse(
    canGoLeft,
    pipe(left, whilst(isBranch, _goToRightmostChild)),
    up,
);

/**
 * Removes item at the current location.
 * Returns location that would be previous in depth first search.
 *
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export function remove(zipper) {
    if (isTop(zipper)) {
        throw new Error('Can\'t remove top.');
    }

    if (isEnd(zipper)) throw new Error('Can\'t remove end');

    const path = getPath(zipper);
    const _lefts = _leftsFromPath(path);

    if (_lefts.length) {
        const leftSibling = zipperFrom(
            zipper,
            last(_lefts),
            merge(path, {
                left: init(_lefts),
                changed: true,
            })
        );
        return whilst(isBranch, _goToRightmostChild, leftSibling);
    } else {
        const _rights = _rightsFromPath(path);
        const parentPath = _parentPath(path);
        const parent = _parent(path);
        return zipperFrom(
            zipper,
            makeItem(zipper, parent, _rights),
            isTop(zipper)
                ? parentPath
                : assoc('changed', true, parentPath)
        );
    }
}


function _insertChild(item, z) {
    const newChildren = [item].concat(getChildren(z));
    return _replace(makeItem(z, item, newChildren), z);
}

function _appendChild(item, z) {
    const newChildren = getChildren(z).concat([item]);
    return _replace(makeItem(z, item, newChildren), z);
}

function makeNullaryMethod(fn) {
    return function nullaryZipperMethod() {
        return fn(this);
    };
}

function makeUnaryMethod(fn) {
    return function unaryZipperMethod(x) {
        return fn(x, this);
    };
}


Object.assign(Zipper.prototype, {

    /**
     * Gets the value of the current location.
     *
     * @alias Zipper.prototype.value
     * @instance
     * @memberof Zipper
     * @returns {T|null}
     */
    value: makeNullaryMethod(value),

    /**
     * Moves location to the root, constructing
     * any changes made.
     *
     * @alias Zipper.prototype.root
     * @instance
     * @memberof Zipper
     * @returns {Zipper}
     */
    root: makeNullaryMethod(root),

    /**
     * Moves location to the parent.
     * If at the top, returns null.
     *
     * @alias Zipper.prototype.up
     * @instance
     * @memberof Zipper
     * @returns {Zipper|null}
     */
    up: makeNullaryMethod(up),

    /**
     * Moves location to the leftmost child.
     * If the current item is a leaf, returns null.
     *
     * @alias Zipper.prototype.down
     * @instance
     * @memberof Zipper
     * @returns {Zipper|null}
     */
    down: makeNullaryMethod(down),

    /**
     * Moves location to the left sibling.
     * If the current location is already the leftmost,
     * returns null.
     *
     * @alias Zipper.prototype.left
     * @instance
     * @memberof Zipper
     * @returns {Zipper|null}
     */
    left: makeNullaryMethod(left),

    /**
     * Moves location to the right sibling.
     * If the current location is already the rightmost,
     * returns null.
     *
     * @alias Zipper.prototype.right
     * @instance
     * @memberof Zipper
     * @returns {Zipper|null}
     */
    right: makeNullaryMethod(right),

    /**
     * Moves location to the leftmost sibling.
     * If the current location is already the leftmost,
     * returns itself.
     *
     * @alias Zipper.prototype.leftmost
     * @instance
     * @memberof Zipper
     * @returns {Zipper}
     */
    leftmost: makeNullaryMethod(leftmost),

    /**
     * Moves location to the rightmost sibling.
     * If the current location is already the rightmost,
     * returns itself.
     *
     * @alias Zipper.prototype.rightmost
     * @instance
     * @memberof Zipper
     * @returns {Zipper}
     */
    rightmost: makeNullaryMethod(rightmost),

    /**
     * Moves location to the next element in depth-first order.
     *
     * @alias Zipper.prototype.next
     * @instance
     * @memberof Zipper
     * @returns {Zipper}
     */
    next: makeNullaryMethod(next),

    /**
     * Moves location to the previous element in depth-first order.
     *
     * @alias Zipper.prototype.prev
     * @instance
     * @memberof Zipper
     * @returns {Zipper}
     */
    prev: makeNullaryMethod(prev),


    /**
     * Returns a boolean indicating if the zipper has been
     * exhausted by calls to `next`.
     *
     * @alias Zipper.prototype.isEnd
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    isEnd: makeNullaryMethod(isEnd),

    /**
     * Returns a boolean indicating if the zipper is at the top.
     *
     * @alias Zipper.prototype.isTop
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    isTop: makeNullaryMethod(isTop),

    /**
     * Returns a boolean indicating if the current location is not a leaf.
     *
     * @alias Zipper.prototype.isBranch
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    isBranch: makeNullaryMethod(isBranch),

    /**
     * Returns a boolean indicating if the current location is a leaf.
     *
     * @alias Zipper.prototype.isLeaf
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    isLeaf: makeNullaryMethod(isLeaf),

    /**
     * Returns a boolean indicating if the item at the current location
     * is the leftmost sibling.
     *
     * @alias Zipper.prototype.isLeftmost
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    isLeftmost: makeNullaryMethod(isLeftmost),

    /**
     * Returns a boolean indicating if the item at the current location
     * is the rightmost sibling.
     *
     * @alias Zipper.prototype.isRightmost
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    isRightmost: makeNullaryMethod(isRightmost),

    /**
     * Alias for `isTop`.
     *
     * @alias Zipper.prototype.canGoUp
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    canGoUp: makeNullaryMethod(canGoUp),

    /**
     * Alias for `isLeftmost`
     *
     * @alias Zipper.prototype.canGoLeft
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    canGoLeft: makeNullaryMethod(canGoLeft),

    /**
     * Alias for `isRightmost`
     *
     * @alias Zipper.prototype.canGoRight
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    canGoRight: makeNullaryMethod(canGoRight),

    /**
     * Alias for `isBranch`
     *
     * @alias Zipper.prototype.canGoDown
     * @instance
     * @memberof Zipper
     * @returns {boolean}
     */
    canGoDown: makeNullaryMethod(canGoDown),

    /**
     * Replaces the current item with value returned
     * by calling `fn` with the current item.
     *
     * @alias Zipper.prototype.edit
     * @instance
     * @memberof Zipper
     * @param {Function} fn - Function that takes the old item
     *                        and returns a new item.
     * @returns {Zipper}
     */
    edit: makeUnaryMethod(_edit),

    /**
     * Replaces the current item with the given value.
     *
     * @alias Zipper.prototype.replace
     * @instance
     * @memberof Zipper
     * @param {T} replaceWith - item to replace the current one with.
     * @returns {Zipper}
     */
    replace: makeUnaryMethod(_replace),

    /**
     * Inserts a new item as the left sibling.
     *
     * @alias Zipper.prototype.insertLeft
     * @instance
     * @memberof Zipper
     * @param {T} item
     * @returns {Zipper}
     */
    insertLeft: makeUnaryMethod(_insertLeft),

    /**
     * Inserts a new item as the right sibling.
     *
     * @alias Zipper.prototype.insertRight
     * @instance
     * @memberof Zipper
     * @param {T} item
     * @returns {Zipper}
     */
    insertRight: makeUnaryMethod(_insertRight),

    /**
     * Inserts a new item as the leftmost child.
     *
     * @alias Zipper.prototype.insertChild
     * @instance
     * @memberof Zipper
     * @param {T} item
     * @returns {Zipper}
     */
    insertChild: makeUnaryMethod(_insertChild),

    /**
     * Inserts a new item as the rightmost child.
     *
     * @alias Zipper.prototype.appendChild
     * @instance
     * @memberof Zipper
     * @param {T} item
     * @returns {Zipper}
     */
    appendChild: makeUnaryMethod(_appendChild),

    /**
     * Removes item at the current location.
     * Returns location that would be previous in depth first search.
     *
     * @alias Zipper.prototype.remove
     * @instance
     * @memberof Zipper
     * @returns {Zipper}
     */
    remove: makeNullaryMethod(remove),
});


/**
 * Makes a Zipper factory that uses the implementation provided
 * in the parameters.
 *
 * @param  {Function} _isBranch - Function with signature`(item: T) => boolean`
 *                               that indicates if the item can have children.
 * @param  {Function} _getChildren - Function with signature`(item: T) => Array<T>`
 *                                  that returns an array of children for a branch.
 * @param  {Function} _makeItem - Function with signature`(item: T, children: Array<T>) => T`
 *                               that returns a new item, given an old item and it's new children.
 * @return {Function} zipper factory with signature `(item: T) => Zipper`. The factory
 *                           can also be accessed from the factory's `from` property.
 */
export function makeZipper(_isBranch, _getChildren, _makeItem) {
    function makeConcreteZipper(item) {
        return new Zipper(
            item,
            TOPPATH,
            {
                isBranch: _isBranch,
                getChildren: _getChildren,
                makeItem: _makeItem,
            }
        );
    }
    makeConcreteZipper.from = makeConcreteZipper;
    return makeConcreteZipper;
}

// Export functions with arity > 1 curried

/**
 * Inserts a new item as the left sibling.
 *
 * @function
 * @param {T} item
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const insertLeft = curry(_insertLeft);

/**
 * Inserts a new item as the right sibling.
 *
 * @function
 * @param {T} item
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const insertRight = curry(_insertRight);

/**
 * Inserts a new item as the leftmost child.
 *
 * @function
 * @param {T} item
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const insertChild = curry(_insertChild);

/**
 * Inserts a new item as the rightmost child.
 *
 * @function
 * @param {T} item
 * @returns {Zipper}
 */
export const appendChild = curry(_appendChild);

/**
 * Replaces the current item with value returned
 * by calling `fn` with the current item.
 *
 * @function
 * @param {Function} fn - Function that takes the old item
 *                        and returns a new item.
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const edit = curry(_edit);

/**
 * Replaces the current item with the given value.
 *
 * @function
 * @param {T} replaceWith - item to replace the current one with.
 * @param {Zipper} zipper
 * @returns {Zipper}
 */
export const replace = curry(_replace);

export default makeZipper;
