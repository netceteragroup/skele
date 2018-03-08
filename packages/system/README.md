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
  system behavior into separate components -- called **subsystems**
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
  hello: example(),
})

const hello = system.hello.helloWorld() // => 'hello world'
```

A subsystem can also be defined using a funciton, in which case
the framework expects that the funciton returns the subsystem itself.

The following example is equivalent to the previous.

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

  return {
    foo,
    hello,
  }
})
```

## Dependencies

Often sub-systems need other sub-systems as dependencies. To declare a subystem's
required dependencies, use the function-form definition mechanism and
and add the dependencies as properties of the first argument:

```javascript
import { System, Subsystem, using } from '@skele/system'

const configuration = Subsystem({
  getConfig() {
    return [1, 2]
  },
})

const example = Subsystem(({ config }) => ({
  hello() {
    return `hello with config ${config.getConfig()}`
  },
}))

// to setup the system

const system = System({
  configuration: configuration(),
  hello: example.using({ config: 'configuration' }),
  //                     ^ name wihtin   ^ name within system
  //                       subsystem
})

// or, in case the name used inside the subsystem is the same
// as the name used in the system

const system2 = System({
  config: configuration(),
  hello: example.using(['config']),
})
```

## Extensions

The framework provides an **extension mechanism** through which dependant subsystems can
extend the behaviour base subsystems in a sort of a inversion of control pattern.

To use the feature, the base subsystem must declare an **extension slot**, i.e. to
define a way how dependant subsystems are able to provide additional functionality.
The extension slot gives shape to the provided. **extensions** ususally by providing a
mini-dsl used to declare them.

A typical usecase for this would be a **router** subsystem; let's examine it.

```javascript
import { Subsystem, ExtensionSlot } from '@skele/system'

// We define an extesnion slot by providing a function that
// returns a new extension everytime it is called

export routes = ExtensionSlot(() => {
  const _routes = []

  return {
    define(url, route) {
      _routes.push([url, route])
    },

    collect() {
      return { routes: _routes }
    }
  }
})

// the extensions provieded by other subsystems are passed on via the
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

The extension slot definition takes a function that produces an **extension** instance for that
slot, everytime it is called (it will be called for every subsytem that wants to provide
extensions to that slot).

The **extension** itself, is an object that is required to respond to the a no-arg `collect()` method.
The method should return the extension data that would be fed in the sub-system that delcared it. The
returned value has to be an JS Object.

That extension instan ce should also provide a mini-dsl used to define an extension. In this case,
that's the `define` method, which is used to define a route.

The subnsystem that declares the **extension slot** receives all the _contributed extensions_ via
the dependency mechanism.

In the example above, the `routes` onject is an _extension slot_ defined by the `router` subsystem.
The `router` subsystem acceptes _contributed extensions_ by declaring a `routes` dependency.

To contribute routes (extensions) another subsystem does:

```javascript
import { Subsystem } from '@skele/system'
import { routes as routesSlot } from './Router'

const App = Subsystem(({ router }) => {})

// create the extenison of the routes slot provided by the App sbusystems
export const routes = routesSlot(App)
App.routes = routes // backtward compatibility

// use the DSL of the extension to shape it, in this case
// defining some routes that the App subsystem handles
routes.define('http://example.com', url => fetch(url))

export default App
```

Finally, to wire things together in a system one would:

```javascript
import { System } from '@skele/system'

import Router, { routes } from './Router'
import App from './App'

export default System({
  router: Router.using({ routes: System.contributions(routes) }),
  app: App.using(['router']),
})
```

The `System.contributions(extensionSlot)` method will insert a special dependency
marker for the system that causes it to collect available extensions (by calling
the `collect()` method on subsystems that contrbute and pass them on as a dependency.
