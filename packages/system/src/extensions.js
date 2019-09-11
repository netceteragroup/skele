'use strict'

import invariant from './invariant'
import * as U from './util'

//
// TODO think about what's curried and what not
/**
 * Property names found in Ext objects.
 * @enum {String}
 * @readonly
 */
export const props = {
  /** Property name identifying a reference to a slot or slots. */
  extOf: '@@skele/extOf',
  /** Property name identifying a the extension factory */
  extFactory: '@@skele/extFactory',
  /** Property name identifying a dependencies object */
  deps: '@@skele/deps',
  /** Property name identifting a query filter function */
  qFilter: '@@skele/qFilter',
  /** Priperty name identifying a whether a single extension is requested */
  one: '@@skele/one',
  /** Property defining an order */
  order: '@@skele/order',
}

/**
 * Order constants, used in queries.
 * @enum {symbol}
 * @readonly
 */
export const order = {
  /** Asks for results in the order as they have been defined */
  definition: Symbol('order/definition'),
  /** Asks for results in topological order. Exts with dependencies (dependants) will
   * be placed after their dependencies. */
  topological: Symbol('order/topological'),
}

/**
 * @typedef Ext - an extension definition.
 *
 * Extension definitions (Exts for short) are central to skele/system.
 * They declare an extension to an extension slot.
 *
 * @property {symbol|[symbol]} @@skele/extOf - the extenson slot (or slots) for
 * extension. Multiple slots are usually used to **name** an extesnion.
 * @property {ExtensionFactory} @@skele/extFactory - the factory function that is
 * used to produce the extension
 * @property {Deps} [@@skele/deps] - the depedency declearationffor
 */

/**
 * @callback ExtensionFactory - a factory function used to create the extension.
 *
 * @param {Object} deps - an object of realized dependencies for the extension extension.
 * @returns {*} - the extension, can be anything
 */

/**
 * @typedef {Object.<string, Query>} Deps - a dependencies declaration.
 *
 * A dependency declaration is a specification of requirements of an extension.
 * It is an map (object) interpredet in the following way:
 * - the key is the name under which the resolved dependency (or dependencies)
 *   will be provided to the factory functon
 * - the value itself is a Query
 */

/**
 * @typedef {TerseQuery|CanonicalQuery} Query
 *
 * A deps query can have be in a terse or canonical form.
 */

/**
 * @typedef {symbol|[symbol]|[symbol, QFilter]|[symbol, QFilter, order]} TerseQuery
 *
 * The terse query format is the one normally used by end users to specify a
 * query. It can have the following forms:
 * - sym   - meaning "the only extensions contributed to the slot sym". If more
 *   than one are found, the last one contributed is taken (allowing for overrides).
 * - [sym] - meaning "all extensions contributed to the extension slot sym"
 * - [sym, pred] - meaining "all extensions contributed to the extension slot
 *   sym that match the predicate pred"
 * - [sym, pred, order] - maning all extension contributed to sym filtered with
 *   pred and returned in the specified order.
 */

/**
 * @callback QFilter - a predicate fn  that returns true the provided extension
 * satisfies itt condition
 * @param {Ext} ext - the extension definition
 * @returns {boolean}
 */

/**
 * @typedef {Object} CanonicalQuery
 *
 * The canonical query format is used internlly by the lbirary.
 *
 * @property {symbol} @@skele/extOf - the symbol identifying the extenson slot
 * @property {QFilter} @@skele/qFilter - the predicate filtering the list of predicates
 * @property {boolean} @@skele/one - a property signifuying whether the query is
 * looking for just one extension (the last one contributed)
 * @property {order} @@skele/order - the order in which the results need to be returned.
 * defaults to order.definition
 */

/**
 * Creates an Ext of the provided slot with the provided factory.
 *
 * Tis is the most basic DSL for creating an extension object.
 *
 * @function
 * @param {symbol|symbol[]} slot the slot this extension contributes to
 * @param {ExtensionFactory} factory the factory-fn used to build the extensions
 */
export const ext = U.curry((slot, factory) => {
  invariant(typeof factory === 'function', 'The factory must be a function')
  invariant(
    () =>
      U.isSymbol(slot) ||
      (Array.isArray(slot) && slot.length > 0 && U.every(U.isSymbol, slot)),
    'Extension slot must be symbol|[symbols]'
  )

  return {
    [props.extOf]: slot,
    [props.extFactory]: factory,
  }
})
/**
 * @callback UpdateFn
 * @param {*} v
 * @returns {*} value
 */
/**
 * The essential modifier for exts. Modifiers are special functions that alter a
 * certain property of one or more exts.
 *
 * This is the most basic modifier used to modify exts; it takes a property,
 * adefault value, an update fn and exts. It will:
 *  - process the exts (or a single ext, if such was given) and
 *  - will read the current value of prop in the ext
 *  - will substitute it with the default value, if it is undefined
 *  - will call f with this value and
 *  - will return a new ext, where the value of prop will be the value returned
 *    by f
 *
 * @function
 * @param {string} prop the property to be modified
 * @param {*} [notFound] an optional value to be used if an ext doesn't have a
 * value under prop
 * @param {UpdateFn} f the update function that does the modification
 * @param {Ext[]|Ext} exts an array of exts or a single ext
 * @returns {Ext[]|Ext} the modified extensions (or a single one,
 * if a single one was provided)
 */
export const modify = (prop, notFound, f, exts) => {
  if (exts == null) {
    exts = f
    f = notFound
    notFound = undefined
  }

  const upd = e => {
    const v = e[prop] == null ? notFound : e[prop]
    return {
      ...e,
      [prop]: f(v),
    }
  }

  return Array.isArray(exts) ? exts.map(upd) : upd(exts)
}

/**
 * A modifier that sets the value of a certain property of exts to val
 * @function
 * @param {string} prop - the property
 * @param {string} val - the value to be set
 * @param {Ext[]|Ext} exts - the extensions to be modified
 * @returns {Ext[]|Ext} the passed extensions with the specified
 * property set
 */
export const set = U.curry((prop, val, exts) =>
  modify(prop, null, () => val, exts)
)

/**
 * Adds a set of deps to the provided ext (or exts)
 * @function
 * @param {Deps} deps the set of deps to be added
 * @param {Ext[]|Ext} exts the extenison(s) to be modified
 */
export const using = U.curry((deps, exts) =>
  modify(props.deps, {}, ds => ({ ...ds, ...parseDeps(deps) }), exts)
)

/**
 * Adds an additional extension slot to the ext (or exts). This additional slot
 * is usually used as a name for the extension.
 *
 * @function
 * @param {symbol} name - the name applied
 * @param {Ext[]|Ext} - extensions
 */
export const named = U.curry((name, exts) =>
  modify(
    props.extOf,
    [],
    s => (Array.isArray(s) ? [...s, name] : [s, name]),
    exts
  )
)
// queries
/**
 * A predicate which always returns true. It's the defualt query predicate.
 * @function
 * @param {*} x - the predicate argument
 * @returns {boolean} true, always
 */
export const all = U.always(true)

/**
 * Parses a potentionally terse query into a caonooica.
 *
 * @param {Query} q the query to be parsed
 * @returns {CanonicalQuery} the canonical version of that query
 */
export const parseQuery = q => {
  if (q[props.extOf] != null) {
    return {
      ...q,
      [props.qFilter]: q[props.qFilter] || all,
      [props.one]: q[props.one] || false,
      [props.order]: q[props.order] || order.definition,
    }
  } else if (U.isSymbol(q)) {
    return {
      [props.extOf]: q,
      [props.one]: true,
      [props.qFilter]: all,
      [props.order]: order.definition,
    }
  } else if (
    Array.isArray(q) &&
    q.length >= 0 &&
    q.length <= 3 &&
    U.isSymbol(q[0])
  ) {
    return {
      [props.extOf]: q[0],
      [props.one]: false,
      [props.qFilter]: q[1] != null ? q[1] : all,
      [props.order]: q[2] != null ? q[2] : order.definition,
    }
  }

  invariant(false, `Invalid query ${q}`)
}
/**
 * Parses a Deps object's queries into their canonical version.
 *
 * @function
 * @param {Deps} deps - a set of dependencies
 * @return {Deps} the same object but with canonical querys
 */
export const parseDeps = U.mapObjVals(parseQuery)

const optional = U.curry((pred, x) => typeof x === 'undefined' || pred(x))
const oneOrMany = U.curry(
  (pred, x) => (Array.isArray(x) && U.every(pred, x)) || pred(x)
)

export const isValidQuery = q => {
  if (q[props.extOf] != null) {
    return (
      oneOrMany(U.isSymbol, q[props.extOf]) &&
      optional(U.isFunction, q[props.qFilter]) &&
      optional(U.isBoolean, q[props.one]) &&
      optional(U.isEnumerated(order), q[props.order])
    )
  } else if (U.isSymbol(q)) {
    return true
  } else if (
    Array.isArray(q) &&
    q.length >= 0 &&
    q.length <= 3 &&
    U.isSymbol(q[0]) &&
    optional(U.isFunction, q[1]) &&
    optional(U.isEnumerated(order), q[2])
  ) {
    return true
  }

  return false
}

export const isValidDeps = deps => {
  if (typeof deps === 'object') {
    return U.flow(
      deps,
      U.objValues,
      U.map(isValidQuery),
      U.every(U.isTrue)
    )
  }
  return false
}

/**
 * Gets the dependency declaration out of the extensions.
 * @function
 * @param {Ext} - the extension definition
 * @returns {Deps}
 */
export const deps = U.prop(props.deps)

/**
 * Gets the extension slots to which the ext is pointing to.
 *
 * @function
 * @param {Ext} ext - the extesion
 * @returns {[symbol]} the extension slot
 */
export const extSlots = U.pipe(
  U.prop(props.extOf),
  U.when(U.isSymbol, s => [s]),
  U.when(U.isNil, U.always([]))
)

/**
 * Gets the extension factory for the specified ext.
 * @function
 * @param {Ext} ext - the extension definition
 * @returns {ExtensionFactory}
 */
export const extFactory = U.prop(props.extFactory)

export const extOf = U.prop(props.extOf)
export const qFilter = U.prop(props.qFilter)
export const isOne = U.prop(props.one)
export const qOrder = U.prop(props.order)
