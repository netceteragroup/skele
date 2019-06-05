# Design goals

The system package aims to allow developers to compose larger *systems* out of
smaller pieces (called *units*) using a *plugin architecture*.

To facilitate this, the goals for the pacakge are:
- A very clear way of defining and combining units of functionality
- Turning-off some funcionality should be achieved by just removing a Unit out
  of the system. This goal predisposes a plugin architecture, where units can
  declare *extension slots*, places that other Units can loosly contribute
  extensions.
- a simple extension mechanism mechanism 
- Be friendly with code splitting, `React.lazy`, Metro bunidler, 
- enable idiomatic declaration of contributions, e.g. collocate the kind of the
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

## Information Model

### Extension

In a completely denormalized form, an extension is an object consiting of at
least two important properties:

```javascript
const extension = {
  '@@skele/ext': '<extension-point>',
  '@@skele/ext-by': '<unit-def>',
  '@@skele/ext-payload': " ... ", // the extension
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

A unit *contributes* a number of *extensions* to the running system. Within a
running system, the extensions are represented as simply a list of *extensions*.

```javascript
import { slots } form 'ui'
const extensions = [
  {
  '@@skele/ext': slots.ui,
  '@@skele/ext-by': 'af3232....',
  '@@skele/ext-payload': " .... ",
  },
]
```

## Structuring a unit-package 

- The pacakage should export its unit as the default export.
- It should contain a named export caled `slots` which exposes all the Symbols
  that are extenison slot identifiers
- For each slot, the package should provide DSL methods that allow contributors
  to construct extensions for this slot as well as extension combnators
- NEW: Extensions unit -- clarify 


## DSLs 

TODO: think about composition.

## Code splitting friendliness

TBD.

### Discuss Metro 

 React native uses object getters to dynamically require in a module when it's
 necessary, typically in a [top level index file][rntoplevel].
 
 The entrypoints of an app are:
 - the units 
 - the extenions (specifically, their payloas)
 
 To allow for fast initialization [and use of RAM bundles / inline
 requires][RAMBundles] one could try to lazy-load/initialize the units
 themselves. However, for the extension mechanism to work, the complete list of
 contributions must be know at initialization time of the first unit needing
 them.
 
 A better strategy would be to lazy load the extenion payloads themselves the
 frist time they are accessed. 
 
 This concern is direclty at odds with the goal that important extenison metadata
 (e.g. the `kind` for which the UI is registered) to be collocated together with
 the extension definition.
 
 
 
 [RNTopLevel]: https://github.com/facebook/react-native/blob/master/Libraries/react-native/react-native-implementation.js
 [RAMBundles]: https://facebook.github.io/react-native/docs/0.59/performance#ram-bundles-inline-requires
 ```
### Discuss React.lazy / create-react-app

