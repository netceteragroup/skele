# girders-elements

[![Build Status](https://img.shields.io/travis/netceteragroup/girders-elements/master.svg?style=flat-square)](https://travis-ci.org/netceteragroup/girders-elements)
[![Coverage Status](https://img.shields.io/coveralls/netceteragroup/girders-elements/master.svg?style=flat-square)](https://coveralls.io/github/netceteragroup/girders-elements?branch=master)

Girders Elements is an architectural framework that assists building **data-driven** apps with **[React](https://facebook.github.io/react/)** or **[React Native](https://facebook.github.io/react-native/)**.
It is extremely well-suited for creating highly **dynamic UI**s, that are driven from back-end systems (like Content Management Systems).

It uses **[redux](http://github.com/reactjs/redux)** for managing the state of the application. All great tools around the redux eco-system can be leveraged, because **girders-elements** is built on top of it.
**[Immutable](https://facebook.github.io/immutable-js/)** data structures are used for redux's single store and also when using **girders-elements** core features.

### Installation

```
npm install --save girders-elements
```
or
```
yarn add girders-elements
```

### Importing

What's inside:

```javascript
import { ui, update, read, Engine } from 'girders-elements';

// ui
ui.register
ui.forElement
ui.forElements

// update
update.register

// read
read.register

// Engine
Engine
```

### Element

The idea behind the Girders Elements framework is to have **elements** that can be driven by the back-end. An element is represented in JSON format

```javascript
{
  "kind": ["teaser", "default"],
  "imageUrl": "http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg"
  "title": "Sherlock Holmes"
}
```

The element is identified by its **kind**. We can **register** the UI of the element for a certain kind, which then makes this element available for representing in the app.

### UI

The UI of an element can be any React Component that takes two props: `element` and `dispatch`.
- The `element` is an immutable.js structure representing the data model (sub-tree) of the specific element in the application state
- The `dispatch` is the standard redux dispatcher for dispatching actions

We register the UI for an element by using:
    
    ui.register(<element-kind>, <element>)
    
For example:

```javascript
ui.register(['teaser', 'default'], ({ element, dispatch }) => {
  return (
    <View>
      <Image source={{uri: element.get('imageUrl')}} />
      <Text>{element.get('title')}</Text>
    </View>
  )
}
```

#### Rendering (Lookup) of an Element

Rendering an element is done via the **ui.forElement** or **ui.forElements** methods. Lets say that the model that drives your UI is in the store represented like the example [above](#element). In case we do:
```javascript
ui.forElement({
  "kind": ["teaser", "image"],
  "imageUrl": "http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg",
  "title": "Sherlock Holmes"
})
```
Then this will return us the **registered** component with kind `['teaser', 'image']`.

#### Canonical Resolution

We can also do the following:
```javascript
ui.forElement({
  "kind": ["teaser", "image", "top"],
  "imageUrl": "http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg",
  "title": "Sherlock Holmes",
  "topStoryColor": "red"
})
```
Notice that the element kind is more specific, `['teaser', 'image', 'top']`. If we haven't registered such an element, its still not a problem, because canonical resolution is done. There is already a element registered for `['teaser', 'image']`, and this element will be rendered. In case we implement a new element, with the more specific kind `['teaser', 'image', 'top']`, and register it, then, of course that element will be returned. This canonical resolution is very useful, in case you introduce new features, but don't want to break clients that are still using older version of a registered elements.

#### Rendering Children

Any element can render a sub-element like so:

```javascript
ui.register(['navigation', 'stack'], ({ element, dispatch }) => {
  return (
    <View>
      {ui.forElement(element.get('children').last())}
    </View>
  )
})
```

A list of children can be rendered using:

```javascript
ui.register(['article'], ({ element, dispatch }) => {
  return (
    <View>
      {ui.forElements(element.get('children'))}
    </View>
  )
})
```

#### Dispatching Actions

An action is just a string identifying what needs to be performed on the state. When one triggers an action, one can also supply additional parameters (payload) to the action that will be provided later on to the update.

The dispatch prop is used to dispatch an action. Actions can be
- **local** - meaning that the action will be handled by an updater for the element from which it was dispatched
- **global** - meaning that the action will be handled by an updater for the action that is either registered for the element from which the action was dispatched, or some of its parents

Global actions are identified by starting dot in the action type (for now, might change in near future).

### Update

Updates are registered in a similar way ui is registered, by using the element kind.

    update.register(<element-kind>, <update-definitions>)

Here is an example:

```javascript
update.register(['article'], elementRegistry => {
  elementRegistry.register('TOGGLE_BOOKMARK', (element, action) => element.set('bookmarked', element.get('bookmarked')));
  elementRegistry.register('.LOAD', (element, action) => element.set('data', action.payload.data)); 
})
```

In this example, for the `article` **element** we register two **updates**:
- a local update, in case `TOGGLE_BOOKMARK` is dispatch only from the `article` element, we change the `bookmarked` flag
- a global update, in case `.LOAD` is dispatch from the `article` element or any of its children

### Read

Reads are a standardaized way to bring data into you app. Most prominent use-case is fetching data from the back-end systems.

Reads are started by preparing:
- the **endpoint** from where the data is going to be fetched
- the **place** where you want the data to be stored (attached) when its successfully fetched

To kick-off a read, you create an **element** with the following structure, on the **place** where you want the data to be attached:

```javascript
{
  "kind": ["__read", "container", "teasers"],
  "uri": "http://www.mocky.io/v2/588333b52800006a31cbd4b9"
}
```

This **read** element, is being resolved, because the frame-work contains a default element registered for the kind `__read`. It doesn't render any UI. This element dispatches a special action and changes the kind to `["__load", "conatiner", "teasers"]`.

Again, there is a default element, registered for `__load`. It renders a loading spinner on the screen. It also disaptches a special action, that will perfrom the actuall fetching of the data. If the data is fetched successfully, then the data will be stored in the node named `children`, and the first element in the kind array will be removed. This will essentially transform the data to:

```javascript
{
  "kind": ["container", "teasers"],
  "uri": "",
  "children": [
    {
      "kind":[
         "teaser",
         "image"
      ],
      "imageUrl":"http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg",
      "title":"Sherlock Holmes"
    },
    {
      "kind":[
         "teaser",
         "image"
      ],
      "imageUrl":"http://img15.deviantart.net/6ee0/i/2010/286/2/2/dr__watson_by_elenutza-d30o87s.png",
      "title":"Dr. Watson"
    }
  ]
}
```

In case error happens, the kind is transormed to `["__error", "container", "teasers"]` and some meta information about the error is stored. The system has an element registered for the kind with `__error` that presents this information.

The elements registered with kinds `__load` and `__error`, are good examples for customiziable elemetns, that you will most probably over-ride with a more specific element kind. When that is done, you need to preserve the behaviour for the process to still continue to work.

### Engine

The Engine is your App.js. You use it to bootstrap an app based on `girders-elements`. It is a React Component that you pass the `initState` prop:

```javascript
const initState = {
  kind: ['app', 'teasers'],
  content: {
    kind: ['__read', 'container', 'teasers'],
    uri: 'http://www.mocky.io/v2/588333b52800006a31cbd4b9'
  }
}

// main render
<Engine initState={initState} />
```
