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
- [4] enable idiomatic declaration of contributions, e.g. collocate the kind of the
  element with the ui. This should take into account the to reduce the cogintive
  overhead related to having to switch between too many editors to be able to
  read the intention of a certain extension.

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
least two important properties:

```javascript
const extension = {
  '@@skele/ext': '<extension-point>',
  '@@skele/ext-by': '<unit-def>',
  '@@skele/ext-payload': ' ... ', // the extension's payload
  '
  // ...
}
```

I.e. the extension says a) which slot is it extending, and b) whcih unit is the
contributor. The rest of the object is the contribution itself.

The extenison can also have additional metdata properties (e.g. `kind`) that
further classify the extension.

### Extension slot

An **extension slot** is just a unique identifer that uniquely identifies the
said slot. It is usually just a `Symbol` (or a unique string).

```javascript
const ui = Symbol('ui') // this the extension
```

### Extenisons

A unit _contributes_ a number of _extensions_ to the running system. Within a
running system, the extensions are represented as simply a list of _extensions_.
All extensions from whole system are collected into a single list, respecting te
initialiation order of the

```javascript
import { slots } from 'ui'
const extensions = [
  {
    '@@skele/ext': slots.ui,
    '@@skele/extBy': 'af3232....',
    '@@skele/extPayload': ' .... ',
  },
]
```

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

### Other Opts?

## Structuring a unit-package

- The pacakage should export its unit as the default export.
- It should contain a named export caled `slots` which exposes all the Symbols
  that are extenison slot identifiers
- For each slot, the package should provide DSL methods that allow contributors
  to construct extensions for this slot as well as extension combnators
- NEW: Extensions unit -- clarify

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

```
### Discuss React.lazy / create-react-app
```
