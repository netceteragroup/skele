'use strict';

import R from 'ramda';

export function anyArg(pred, rangeStart = 0, rangeEnd = undefined) {
  return (arity, args) => {
    let e;
    if (rangeEnd == null) {
      e = arity + 1
    } else {
      e = args.length
    }
    if (e < 0) e = args.length - e;
    if (e >= args.length) e = args.length;

    let s = rangeStart;
    if (s < 0) s = e + s;

    // console.log("args ", args, "rangeStart ", rangeStart, "s ", s, "e ", e)
    for (let i = s; i < e; i++) {
      if (pred(args[i])) return true;
    }

    return false;
  }
}

export function lastArg(pred) {
  return (arity, args) =>  args.length > 0 ? pred(args[args.length - 1]) : false;
}

export function firstArg(pred) {
  return (arity, args) => args.length > 0 ? pred(args[0]) : false;
}

function invoker(arity, method) {
  if (typeof method === 'function') return method;
  return R.invoker(arity, method);
}

function invoker2(arity, method) {
  if (typeof method === 'function') return method;

  return (...args) => args[args.length - 1][method](...(args.slice(0, -1)));
}

function original(arity, fn) {
  if (typeof fn === 'function') return fn;
  return R[fn];
}

export function dispatch (arity, pred, method, orig) {
  if (Array.isArray(pred)) {
    return R.curryN(arity, R.cond(pred));
  } else {
    const o = original(arity - 1, orig);
    const i = invoker2(arity, method);

    return R.curryN(arity,
      (...args) => {
        if (pred(arity, args)) {
          return i(...args);
        } else {
          return o(...args);
        }
      }
    )
  }
}
export const dispatch2 = function dispatch(arity, pred, method, orig) {
  if (Array.isArray(pred)) {
    return R.curryN(arity, R.cond(pred));
  } else {
    return R.curryN(arity,
      R.ifElse((...args) => pred(arity, args), // make sure the predicate actually works on the "declared" arg set
        invoker(arity - 1, method),
        original(arity, orig)));
  }
}

export function pass(method) {
  return () => { throw new Error(`The function ''${method}' is not yet implemented for immutable'`) };
}
