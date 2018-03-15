# Skele System

[![Build Status](https://img.shields.io/travis/netceteragroup/skele/master.svg?style=flat-square)](https://travis-ci.org/netceteragroup/skele)
[![Coverage Status](https://img.shields.io/coveralls/netceteragroup/skele/master.svg?style=flat-square)](https://coveralls.io/github/netceteragroup/skele?branch=master)

`@skele/system` is a small framework for building extensible application systems using
[Plug-In Architecture](http://wiki.c2.com/?PluginArchitecture).

# Introduction

The aims of the framework are the following:

* allow for application systems that offer ready-made functionality that can be
  altered and customized easily in a defined way, by means of
  * allowing for better _separation of concerns_ by allowing the grouping together of related
    system behavior into separate coarse components -- called **subsystems**
  * allowing for defining loose coupled interfaces between the subsystems -- called
    **extensions**

Within the context of this framework, a **subsystem** is a collection of functions and
methods that share a common _state_ often an aspect of which is external to the application
written using the framework. More specifically, a subsystem is an object containing some
state and functions.

An **extension slot** is a formal declaration of a behavior, related to a _subsystem_ that
can be extended (by means of addition or override/replacement) by **dependent subsysyems**.

Lastly, an **extension** is the addition / override that a a **dependent subsystem**
contributes to another. The phrasef _subsystem A contributes an extension
to subsystem B_ is also used to describe relationship.

The framework is inspired by <https://github.com/stuartsierra/component> with the addition
of an extension mechanism, which is inspired by work done withn <https://eclipse.org> and
the (Apache Tapestry IOC)[http://tapestry.apache.org/ioc.html].

# Usage

## Defining Subsystems

The simplest way to define a subsystem is to provide the subsystem-object to the `Subsystem`
function.

```javascript
import { System, Subsystem } from '@skele/system'

const example = Subsystem({
  foo: 1,

  helloWorld() {
    return 'hello world'
  },
})

const system = System({
  hello: example,
  hello2: example(), // can also be instantiated cirectly
})

const hello = system.hello.helloWorld() // => 'hello world'
```

A subsystem can also be defined using a funciton, in which case
the framework expects that the funciton returns the subsystem itself.

The following example is equivalent to the previous one.

```javascript
import { Subsystem } from '@skele/system'

const example = Subsystem(() => {
  var foo = 1

  function hello() {
    return 'hello world'
  }

  return {
    foo,
    hello,
  }
})
```

## Lifecycle

A subsystem can optionally define a `start()` and `stop()` methods that will be invoked
upon system startup.

```javascript
import { Subsystem } from '@skele/system'

const example = Subsystem(() => {
  var foo = 1

  function hello() {
    return 'hello world'
  }

  function start() {
    // called when the system starts
  }

  function stop() {
    // called when the system stops
  }

  return {
    foo,
    hello,
    start,
    stop,
  }
})
```

## Dependencies

Often sub-systems need other sub-systems as dependencies. To declare a subystem's
required dependencies, use the function-form definition mechanism and
and decleare the reqiuired dependencies as properties of the first argument:

```javascript
import { System, Subsystem, using } from '@skele/system'

const configuration = Subsystem({
  getConfig() {
    return [1, 2]
  },
})

// The example subsysrtem requires a named dependency -- config
const example = Subsystem(({ config }) => ({
  hello() {
    return `hello with config ${config.getConfig()}`
  },
}))

// to setup the system

const system = System({
  configuration: configuration(),
  hello: using({ config: 'configuration' }, example),
  //             ^ reads "configuration as config"
  //               i.e, pass the "configuration" subsystem
  //               named as 'config' when instantiating hello
})

// or, in case the name used inside the subsystem is the same
// as the name used in the system

const system2 = System({
  config: configuration(),
  hello: using(['config'], example), // same as
  hello2: using({ config }, example) // same as
  hello3: using({ config: 'config' }, example)
})
```

The `using(depMapping)` method as a wrapper around a subsystem to map it's declared
dependencies to other subsystems within the system.

The mehod takes a map/object as a first argument, which indicates which declared depenency
(the property name) should be satisfied with which subsystem (the property value) from
within the system being defined.

## Extensions

The framework provides an **extension mechanism** through which dependant subsystems can
extend the behaviour base subsystems in a sort of a inversion of control pattern.

To use the feature, the base subsystem must declare an **extension slot**, i.e. to
define a way how dependant subsystems are able to provide additional functionality.
The extension slot gives shape to the **extensions** usually by providing a
mini-dsl.

A typical usecase for this would be a **router** subsystem that can dispatch on any
number of contributed **routes**. Let's examine it.

```javascript
import { Subsystem, ExtensionSlot } from '@skele/system'

// We define an extesnion slot by providing a function that
// returns a new extension everytime it is called

export const routesSlot = ExtensionSlot(() => {
  const _routes = []

  return {
    // this is a mini-dsl method used to define a routes extension
    // by contributing subsystems
    define(url, route) {
      _routes.push([url, route])
    },

    collect() {
      return { routes: _routes }
    }
  }
})

// the extensions provided by other subsystems are passed on via the
// dependencies object
const Router = Subsystem(({ routes }) => {
  // given a URL the router 'navigates' to it
  navigate(url) {

    const route = findRoute(routes, url)
    return route.invoke()
  }
})

const findRoute = (routes, url) =>
  routes
    .map(extension => extension.routes)
    .flatten()
    .find(r => r[0] == url)

export default Router
```

The extension slot definition takes a function that produces a new **extension** for that
slo, everytime it is called (it will be called for every subsystem that wants to provide
extensions to that slot).

The **extension** itself, is an object that is required to respond to the a no-arg `collect()` method.
The method should return the extension data that would be fed in the sub-system that delcared it. The
returned value has to be an JS Object.

That extension instan ce should also provide a mini-dsl used to define an extension. In this case,
that's the `define` method, which is used to define a route.

The subsystem that declares the **extension slot** receives all the _contributed extensions_ via
the dependency mechanism.

In the example above, the `routes` onject is an _extension slot_ defined by the `router` subsystem.
The `router` subsystem acceptes _contributed extensions_ by declaring a `routes` dependency.

To contribute routes (extensions) another subsystem does:

```javascript
import { Subsystem, using, contributions } from '@skele/system'
import { routesSlot } from './Router'

const App = Subsystem(({ router }) => {})

// create the extenison of the routes slot provided by the App sbusystems
export const routes = routesSlot(App)

App.routes = routes // "classic" compatibility

// use the DSL of the extension to shape it, in this case
// defining some routes that the App subsystem handles
routes.define('http://example.com', url => fetch(url))

export default App
```

Finally, to wire things together in a system one would:

```javascript
import { System } from '@skele/system'

import Router, { routesSlot } from './Router'
import App from './App'

export default System({
  router: using({ routes: contributions(routesSlot) }, Router),
  app: using(['router'], App),
})
```

The `contributions(extensionSlot)` method will insert a special dependency
marker for the system that causes it to collect available extensions (by calling
the `collect()` method on subsystems that contrbute and pass them on as a dependency.

## Ordering of subsystems (and extensions)

When a subsystem uses extensions, the order in which these extensions are delivered
to a subsystem often becomes important. E.g. when multiple routes match a given,
URL, which one is given precedence?

The framework will pass on extensions to a subsystem **in the order in which it
instantiated the subsystems**.

When you are defining a System (using an object as specification), this order will be
detrmined by the _enumeration order_ (`for .. in`) of the properties of the specification,
minimally adjusted so that the dependencies of a subystem are instantiated before it itself
is instantiated (topological sort).

Even though the JS specification states that the `for...in` enumeration order is not defined
for objects, In most JS environments, this enumeration orer will be the order in which the properties
appear in the object literal, e.g. for

```javascript
const sys = System({
  router: using({ x: 'x', routes: contributions(routesSlot) }, router),
  approutes: approutes,
  x: y,
})
```

The enumeration order will be `[router, approutes, x]`, and consequently the ordering of the subsystems
will be `[x, router, approutes]` (`x` goes in front of `router` because it is a dependency).

If it is vital for your app to make sure this order is predictable accross JS envs, then you may also
use the _array of touples_ form (same form as the result of `Object.entries()`) to specify
the system:

```javascript
const sys = System([
  ['router', using({ x: 'x', routes: contributions(routesSlot) }, router)],
  ['approutes', approutes],
  ['x', y],
])
```

This way the subsystem instantiation order, and therefore the **extension order** will be stable in all
environments.

But ultimately, if you wish that an extension provided by subsystem `A` has more precedence (comes later in
the extension order) than the extension provided by subsystem `B`, it is better **not to rely on the instantiation
order at all**, but to make this ordering more explicit. You can do that by just introducing `B` as dependency
of `A`, even though you aren't accessing this object:

```javascript
const sys = System({
  router: using({ x: 'x', routes: contributions(routesSlot) }, router),
  productRoutes: productroutes,
  tenantRoutes: using(['productRoutes'], tenantRoutes),
  x: y,
})
```

By making `productRoutes` a dependency of `tenantRoutes` we make sure the in the order in which
extensions are passed to the `router`, the tenant routes will always come after product routes.

To make this intent more clear, we've made `after` an alias for `using`. So you would write:

```javascript
import { System, contributions, using, after } from '@skele/system'

import router, { routesSlot } from './router'
import productRoutes from './productRoutes'
import tenantRoutes from './tenantRoutes'
import y from './y'

const sys = System({
  router: using({ x: 'x', routes: contributions(routesSlot) }, router),
  productRoutes: productroutes,
  tenantRoutes: after(['productRoutes'], tenantRoutes),
  x: y,
})
```
