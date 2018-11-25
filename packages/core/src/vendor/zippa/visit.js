import curry from 'ramda/src/curry';
import has from 'ramda/src/has';
import {
    value,
    canGoDown,
    canGoRight,
    up,
    right,
    down,
    isNotTop,
    replace,
    root,
} from './zipper';

/**
 * Pre-event identifier.
 * @type {String}
 * @default
 * @constant
 */
export const PRE = 'PRE';

/**
 * Post-event identifier.
 * @type {String}
 * @default
 * @constant
 */
export const POST = 'POST';


function visitItem(event, initialItem, initialState, visitors) {
    let _item = initialItem;
    let _state = initialState;
    let _stop = false;
    let _cut = false;
    let i = 0;
    for (; i < visitors.length; i++) {
        const visitor = visitors[i];
        const res = visitor(event, _item, _state) || {};

        const {
            item,
            state,
            stop,
            cut,
        } = res;

        if (has('item', res)) _item = item;
        if (has('state', res)) _state = state;

        if (stop || cut) {
            _stop = stop;
            _cut = cut;
            break;
        }
    }

    return { item: _item, state: _state, stop: _stop, cut: _cut };
}

function visitLocation(event, zipper, _state, visitors) {
    const res = visitItem(event, value(zipper), _state, visitors) || {};
    const {
        item,
        state,
        stop,
        cut,
    } = res;

    return {
        // Will not do anything if ctx.item === value(item)
        loc: res.hasOwnProperty('item') ? replace(item, zipper) : zipper,
        state: res.hasOwnProperty('state') ? state : _state,
        stop,
        cut,
    };
}

const DOWN = 'DOWN';
const RIGHT = 'RIGHT';

function finishVisit(loc, state) {
    return { item: value(root(loc)), state };
}


/**
 * Visits the data structure in depth-first order, calling
 * one or more visitors on each node, on pre and post events.
 *
 * The visitor functions are called with three arguments:
 * - `event` - {@link PRE} or {@link POST}
 * - `item` - the item currently being visited
 * - `state` - the state of the visit
 *
 * If you're visiting for side-effects, you don't have to return
 * anything from your visitor function. To edit items, visit state,
 * or stop the visit, you must return an object which can have
 * zero or more of the following keys:
 *
 * - `item`: if supplied, will replace the item at the current location
 *   with the supplied value. The data structure won't change if the value
 *   has the same reference as the current value.
 * - `state`: if supplied, will update the state of the visit with the
 *   value. State is shared with all visitors.
 * - `stop`: if truthy, will stop the visit
 * - `cut`: if truthy, will skip the subtree of the current node.
 *
 * Returns an object with the following keys:
 *
 * - `item`: the item value in the zipper after visiting the whole data structure.
 * - `zipper`: the zipper value after visiting the whole data structure.
 * - `state`: the state at the end of the visit.
 *
 * @param  {Function[]} visitors - Array of visitor functions
 * @param  {*} [initialState] - Initial state for the visit
 * @param  {Zipper} initialZipper - A Zipper value to visit
 * @return {Object}
 */
export const visit = curry(function visit(visitors, initialState, initialZipper) {
    let direction = DOWN;
    let z = initialZipper;
    let state = initialState;
    let isFirst = true;
    while (isFirst || isNotTop(z)) {
        isFirst = false;
        if (direction === DOWN) {
            // Going down, which means we start visiting this subtree.
            // Apply pre-visitor to the current location.
            const res = visitLocation(PRE, z, state, visitors);
            state = res.state;
            z = res.loc;

            if (res.stop) return finishVisit(z, state);

            if (!res.cut && canGoDown(z)) {
                z = down(z);
            } else {
                // Can't go down, so on next iteration
                // we try to go right.
                direction = RIGHT;
            }
        } else if (direction === RIGHT) {
            // Going right, which means we've visited the whole
            // subtree of the current item. Applying the post-visitor.
            const res = visitLocation(POST, z, state, visitors);
            state = res.state;
            z = res.loc;

            if (res.stop) return finishVisit(z, state);

            if (canGoRight(z)) {
                z = right(z);
                direction = DOWN;
            } else {
                // Can't go right, therefore we go up.
                // For the next loop iteration, we want to try
                // going right as well to stay in depth-first search
                // order.
                z = up(z);
                direction = RIGHT;
            }
        }
    }

    // We are back at the root, but that still needs the post-visitor.
    const res = visitLocation(POST, z, state, visitors);
    state = res.state;
    z = res.loc;

    return {
        item: value(z),
        zipper: z,
        state,
    };
});

const onEvent = curry(
    (matchEvent, fn) =>
        (event, item, state) =>
            event === matchEvent ? fn(item, state) : undefined
);

/**
 * Takes a visitor function that takes an `item` and `state` argument,
 * and returns a visitor function that is only invoked on the pre-event.
 *
 * Equal to:
 *
 * ```javascript
 * const myVisitor = (item, state) => console.log('visited item', item);
 * function visitor(event, item, state) {
 *     if (event === PRE) return myVisitor(item, state);
 * }
 * ```
 *
 * @param {Function} fn - visitor function that takes `item` and `state` arguments
 * @returns {Function} visitor function
 */
export const onPre = onEvent(PRE);

/**
 * Takes a visitor function that takes an `item` and `state` argument,
 * and returns a visitor function that is only invoked on the post-event.
 *
 * Equal to:
 *
 * ```javascript
 *
 * const myVisitor = (item, state) => console.log('visited item', item);
 * function visitor(event, item, state) {
 *     if (event === POST) return myVisitor(item, state);
 * }
 * ```
 *
 * @param {Function} fn - visitor function that takes `item` and `state` arguments
 * @returns {Function} visitor function
 */
export const onPost = onEvent(POST);
