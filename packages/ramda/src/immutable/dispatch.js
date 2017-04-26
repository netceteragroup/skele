'use strict';

import R from 'ramda';

export function anyArg(pred, focus = R.identity) {
  return (...args) => R.any(pred, focus(args));
}

export function lastArg(pred) {
  return (...args) =>  args.length > 0 ? pred(args[args.length - 1]) : false;
}

export function firstArg(pred) {
  return (...args) => args.length > 0 ? pred(args[0]) : false;
}

function invoker(arity, method) {
  if (typeof method === 'function') return method;
  return R.invoker(arity, method);
}

function original(arity, fn) {
  if (typeof fn === 'function') return fn;
  return R[fn];
}

export const dispatch = function dispatch(arity, pred, method, orig) {
  if (R.isArrayLike(pred)) {
    return R.curryN(arity, R.cond(pred));
  } else {
    return R.curryN(arity,
      R.ifElse(pred,
        invoker(arity - 1, method),
        original(arity, orig)));
  }
}
