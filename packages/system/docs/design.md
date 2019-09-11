# Design goals

The system package aims to allow developers to compose larger _systems_ out of
smaller pieces (called _units_) using a _plugin architecture_.

To facilitate this, the goals for the pacakge are:

- [1] A very clear way of defining and losely combining units of functionality
- [2] Turning-off some funcionality should be achieved by just removing a Unit out
  of the system. This goal predisposes a plugin architecture, where units can
  declare _extension slots_, places that other Units can loosly contribute
  extensions.
- [3] Be friendly with code splitting, `React.lazy`, Metro bunidler,
- [4] enable good idioms for the declaration of contributions, e.g. collocate
  the kind of the element with the ui. This should take into account the to
  reduce the cogintive overhead related to having to switch between too many
  editors to be able to read the intention of a certain extension.

# Extension Mechanism

The extension mechanism enables building apps using a plugin architecture. It
allows key things:

- A unit can declare an extension slot. The slot is a simply an identifier of
  the extensions the unit is able to make use of
- An extension is a data object that describes the extensions
- During system composition, extensions can be injected into a unit using a
  powerful filtering mechanism

There's a need for an information model for the extension mechanism. A dsl may
or may not be added on top of it.

For a very similar mechanism, look at what [VSCode][] is doing. Our design goal
slightly deviates from this as we want the extenisons to be declared fluidly in code.

[vscode]: https://code.visualstudio.com/api/references/contribution-points

## Information Model

### Extension

In a completely denormalized form, an extension is an object consiting of at
least three important properties:

```javascript
const extension = {
  '@@skele/extOf': '<extension-slot>',
  '@@skele/ext': ' ... ', // the extension's factory fn
  '@skele/deps': {},
  // ...
}
```

- `@@skele/extOf` contains the symbol that identifies the
- `@@skele/ext` contains the extension itself. It is a _factory function_
  that takes the extension's dependencies and produces the extension itself
- `@@skele/deps` contains a mapping from names to _contribution queries_ that is
  used to find the extensions to be used when calling the factory fn.

I.e. the extension says a) which slot is it extending.

The extenison can also have additional metdata properties (e.g. `kind`) that
further classify the extension. These properties can be used when building the
contribution queries later on.

### Extension slot

An **extension slot** is just a unique identifer that uniquely identifies the
said slot. It is usually just a `Symbol` (or a unique string).

```javascript
const ui = Symbol('ui') // this the extension
```

### Contribution Query

A contribution query is a an object int he form:

```javascript
const q = {
  '@@skele/ext': aSymbol,
  '@@skele/qFilter': predicateFn, // optional
  '@@skele/one': boolean, // optional, defaults to false
}
```

Where:

There is a _terse_ form of the query :

```javascript
const ui = Symbol('ui') // ext slot

const q1 = ui  // means get the one extension contributed to the slot 'ui'
const q2 = [ui] // means get all the extensions contributed to the slot 'ui'
const q3 = [ui, e => e.tag === 'foo'] // same above, but filtered with predicated pred

expect(q1).toBeEquivalentQueryTo({
  '@@skele/ext': ui,
  '@@skele/one': true
})

expect(q2).toBeEquivalentQueryTo({
  '@@skele/ext': ui,
  '@@skele/one': false
})

expect(q2).toBeEquivalentQueryTo({
  '@@skele/ext': ui,
  '@@skele/one': false
  '@@skele/qFilter': e => e.tag === 'foo',
})
```

### Unit, System

A unit is simply a list of extensions that make sense together (as a
unit). These extensions are have already preconfigured contribution queries.

- [x] Do we allow overriding contribution queries of extensions in an included
      unit? **Let's try with no.**

Units can include other units, which effectively adds the contributions from the
included unit into the including one.

A system is, again, a just list of extensions.

### Dependencies and Ordering

Since we are working with lists of extensions, or possibly trees of units (which
themselves contain ordered lists of extensioin and/or other units) The order in
which extensions are made avallable is naturally given.

## DSLs

The library should allow users to easily develop DSLs for specifying extensions.
The DSL supporting functions need to be composable so that one can progressively
construct the extensions.

Examples:

```javascript
const slots = {
  ui: Symbol('ui'),
  update: Symbol('update'),
}

const singleUi = forKind(['app'], ui(props => <div />))

import third from './thirdUi'

const several = forKind(
  ['app'],
  ui(props => <span />),
  ui(props => <div />),
  ui(third)
)

// mixing several extensions
const app = forKind(
  ['app'],
  ui(third),
  update('acton', app => app.set('foo', 'bar')),
  effect('action2', async bla => x)
)
// this allows to collocate nicely related things for more clarity

// this form is possible as well
const appUi = flow(
  ui(third),

  forKind(['app']),
  forVariant('tablet')
)

// The following example is not possible
const referse = ui(forKind(['app'], props => <div />))
```

We can see that there there are two types of methods in this example:

- an extension producing fn like `ui` that produces an extension, these are
  _extension factory functions_
- a _mddifier_ fn that modifies the data of extensions passed, usually adding
  some metadata

## Attaching Extensions to a unit

We go with option C.

### Option A: special unit brings in extensions

```javascript
const exts = Extensions([
  ...forKind(['app'],
    ui(third),
    update('acton', app => app.set('foo', 'bar')),
    effect('action2', async (bla) =>  x))
  ),

  ...forKind(['foo']. ui(uiFoo))
])

const unit = Unit(() => { })

export SubSystem({
  main: unit,
  exts,
})
```

### Option B: Part of the definition of a unit

```javascript
const unit = Unit({
  exts: [
  ...forKind(['app'],
    ui(third),
    update('acton', app => app.set('foo', 'bar')),
    effect('action2', async (bla) =>  x))
  ),

  ...forKind(['foo']. ui(uiFoo))
  ],

  main: () => {}, // unit factory fn
})

export SubSystem({
  main: unit,
  exts,
})
```

### Option C: Redefine Unit as a collection of extensions (or even a single extenison)

The unit could also be redefined as _just a colleciton of extensions_ that is
managed togeteher.

In this case the actual unit factory method (the one taking dependencies and
returning a startable / stoppable boject) is just another extension.

```javascript
const slots = {
  runtime: Symbol('runtime'),
}

const runtime = (factoryFn) => { /* extension for the runtime slot */ }

const r = runtime(() => {
  start() {

  }

  stop() {

  }
})
const ui = flow(ui(app), forKind(['app']))

// now the system
const s = Subsystem({
  u1: Unit([runtime, ui])
})
```

But then the question is, what happens with dependency injection? If we examine
the case of (effects)[../../classic/src/effects/index.js] we can spot the
following:

- The unit exposes an extension slot called `effect`
- All it does with it is collect all contributed effects and then provides
  another extension (middleware) to another unit (the kernel)

We would need to express this somehow.

Another concern is that often an extension needs access to another unit or
runtime (for querying or message sending). For example:

- an ap-wide store subsystem would need to expose querying the current state
  which would be kept in a runitme somewhere
- a bookmarking subsystem would need to expose the ability to add or remove
  bookmarks, also to query them

This approach would need to redefine the dependency management. Though it
simiplifies the core model (everythign is an extension) it might make practical
use more cumbersome.

It does give and alternative to the _context_ problem for various types of
extensions, e.g.

- `uiFor`, `theme`, custom ui contexts (like text resources) become just
  dependencies of a _ui_ extension (though hooks in the ui may be better for
  this)
- injecting other subsystems into _reads_ avoids the context problem again

We would like to be able to define ui simply as:

```javascript
export default ui((props =>
  <View>
  </View>))

// but also allow for dependencies on a compositional way:

export default ui(
  ({dispatch, uiFor}) =>
    props =>
      <View>
      </View>)
```

But then how do we make system composition not cumbersome? Do we ask that for
every conctribution, we specify the dependencies?

Or perhaps some default `contributions` config.... Worth thinking about...

Also, the curried form of contributions perhaps cumboerson (see redux). Maybe on
the DSL level we would hide it and have:

```javascript
export default ui(({ dispatch, uiFor }, props) => <View />)
```

### Other Opts?

## Structuring a unit-package

- The pacakage should export its unit as the default export.
- It should contain a named export caled `slots` which exposes all the Symbols
  that are extenison slot identifiers
- For each slot, the package should provide DSL methods that allow contributors
  to construct extensions for this slot as well as extension combnators

## Code splitting friendliness

TBD.

### Discuss Metro

React native uses object getters to dynamically require in a module when it's
necessary, typically in a [top level index file][rntoplevel].

The entrypoints of an app are:

- the units
- the extenions (specifically, their payloas)

To allow for fast initialization [and use of RAM bundles / inline
requires][rambundles] one could try to lazy-load/initialize the units
themselves. However, for the extension mechanism to work, the complete list of
contributions must be know at initialization time of the first unit needing
them.

A better strategy would be to lazy load the extenion payloads themselves the
frist time they are accessed.

This concern is direclty at odds with the goal that important extenison metadata
(e.g. the `kind` for which the UI is registered) to be collocated together with
the extension definition.

[rntoplevel]: https://github.com/facebook/react-native/blob/master/Libraries/react-native/react-native-implementation.js
[rambundles]: https://facebook.github.io/react-native/docs/0.59/performance#ram-bundles-inline-requires

### Discuss React.lazy / create-react-app
