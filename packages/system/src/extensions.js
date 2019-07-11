'use strict'

import invariant from './invariant'
import * as u from './util'

//
// TODO think about what's curried and what not
/**
 * @namespace
 *
 * Use these props ffor name s
 */
export const props = {
  /** Property name identifying a reference to a slot or slots. */
  extOf: '@@skele/extOf',
  /** Property name identifying a the extension factory */
  ext: '@@skele/ext',
  /** Property name identifying a dependencies object */
  deps: '@@skele/deps',
  /** Property name identifting a query filter function */
  qFilter: '@@skele/qFilter',
  /** Priperty name identifying a wether a single extension is requested */
  one: '@@skele/one',
}

/**
 * @typedef Extension - an extension object.
 *
 * Extension objects are central to skele/system. They declare a contribution to
 * an extension slot.
 *
 * @property {symbol|[symbol]} @@skele/extOf - the extenson slot (or slots) for
 * extension. Multiple slots are usually used to **name** an extesnion.
 * @property {ExtensionFactory} @@skele/ext - the factory function that is
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
 * @typedef {symbol|[symbol]|[symbol, QFilter]} TerseQuery
 *
 * The terse query format is the one normally used by end users to specify a
 * query. It can have the following forms:
 * - sym   - meaning "the only extensions contributed to the slot sym". If more
 *   than one are found, the last one contributed is taken (allowing for overrides).
 * - [sym] - meaning "all extensions contributed to the extension slot sym"
 * - [sym, pred] - meaining "all extensions contributed to the extension slot
 *   sym that match the predicate pred"
 */

/**
 * @callback QFilter - a predicate fn  that returns true the provided extension
 * satisfies itt condition
 * @param {Extension} ext - the extension
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
 */

/**
 * Creates an extenions of the provided slot with the provided factory.
 *
 * Tis is the most basic DSL for creating an extension object.
 *
 * @function
 * @param {symbol|symbol[]} slot the slot this extension contributes to
 * @param {ExtensionFactory} factory the factory-fn used to build the extensions
 */
export const ext = u.curry((slot, factory) => {
  invariant(typeof factory === 'function', 'The factory must be a function')
  invariant(
    () =>
      u.isSymbol(slot) ||
      (Array.isArray(slot) && slot.length > 0 && u.every(u.isSymbol, slot)),
    'Extension slot must be symbol|[symbols]'
  )

  return {
    [props.extOf]: slot,
    [props.ext]: factory,
  }
})
/**
 * @callback UpdateFn
 * @param {*} v
 * @returns {*} value
 */
/**
 * DSL function that modifies the property prop of each ext in exts.
 *
 * This is the most basic modifier used to modify extensions.
 *
 * @function
 * @param {string} prop the property to be modified
 * @param {*} [notFound] an optional value to be used if an ext doesn't have a
 * value under prop
 * @param {UpdateFn} f the update function that does the modification
 * @param {Extension[]|Extension} exts an array of exts or a single ext
 * @returns {Extension[]|Extension} the modified extensioons (or a single one,
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
 * @param {Extension[]|Extension} exts - the extensions to be modified
 * @returns {Extension[]|Extension} the passed extensions with the specified
 * property set
 */
export const set = u.curry((prop, val, exts) =>
  modify(prop, null, () => val, exts)
)

/**
 * Adds a set of deps to the provided ext (or exts)
 * @function
 * @param {Deps} deps the set of deps to be added
 * @param {Extension[]|Extension} exts the extenison(s) to be modified
 */
export const using = u.curry((deps, exts) =>
  modify(props.deps, {}, ds => ({ ...ds, ...parseDeps(deps) }), exts)
)

/**
 * Adds an additional extension slot to the ext (or exts). This additional slot
 * is usually used as a name for the extension.
 *
 * @function
 * @param {symbol} name - the name applied
 * @param {Extension[]|Extension} - extensions
 */
export const named = u.curry((name, exts) =>
  modify(
    props.extOf,
    [],
    s => (Array.isArray(s) ? [...s, name] : [s, name]),
    exts
  )
)
// queries
const every = () => true

/**
 * Parses a potentionally terse query into a caonooica.
 *
 * @param {Query} q the query to be parsed
 * @returns {CanonicalQuery} the canonical version of that query
 */
export const parseQuery = q => {
  if (q[props.extOf] != null) {
    return q
  } else if (u.isSymbol(q)) {
    return {
      [props.extOf]: q,
      [props.one]: true,
      [props.qFilter]: every,
    }
  } else if (
    Array.isArray(q) &&
    q.length >= 0 &&
    q.length <= 2 &&
    u.isSymbol(q[0])
  ) {
    return {
      [props.extOf]: q[0],
      [props.one]: false,
      [props.qFilter]: q[1] != null ? q[1] : every,
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
export const parseDeps = u.mapObjVals(parseQuery)

/**
 * Gets the dependency declaration out of the extensions.
 * @function
 * @param {Extension} - the extension
 * @returns {Deps}
 */
export const deps = u.prop(props.deps)

/**
 * Gets the extension slots to which the ext is pointing to.
 *
 * @function
 * @param {Extension} ext - the extesion
 * @returns {[symbol]} the extension slot
 */
export const extSlots = u.pipe(
  u.prop(props.extOf),
  u.when(u.isSymbol, s => [s]),
  u.when(u.isNil, u.always([]))
)

/**
 * Gets the extension factory for the specified ext.
 * @function
 * @param {Extension} ext - the extension
 * @returns {ExtensionFactory}
 */
export const extFactory = u.prop(props.ext)

export const extOf = u.prop(props.extOf)
export const qFilter = u.prop(props.qFilter)
export const isOne = u.prop(props.one)
