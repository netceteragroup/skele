# girders-elements

[![Build Status](https://travis-ci.org/netceteragroup/girders-elements.svg?branch=master)](https://travis-ci.org/netceteragroup/girders-elements)
[![Coverage Status](https://coveralls.io/repos/github/netceteragroup/girders-elements/badge.svg?branch=master)](https://coveralls.io/github/netceteragroup/girders-elements?branch=master)

Girders Elements is an architectural framework that assists building **data-driven** apps with **[React](https://facebook.github.io/react/)** or **[React Native](https://facebook.github.io/react-native/)**.
It is extremely well-suited for creating highly **dynamic UI**s, that are driven from back-end systems (like Content Management Systems).

It uses **[redux](http://github.com/reactjs/redux)** for managing the state of the application. All great tools around the redux eco-system can be leveraged, because `girders-elements` is built on top of it.
**[Immutable](https://facebook.github.io/immutable-js/)** data structures are used for redux's single store and also when using `girders-elements` core features.

### Installation

```
npm install --save girders-elements
```
or
```
yarn add girders-elements
```

### Importing

```javascript
import { ui } from 'girders-elements';
// equivalent with
import ui from 'girders-elements/ui';

import elements from 'girders-elements';

// what's inside
elements.ui
elements.read
elements.update
elements.boot

// ui
ui.register
ui.forElement
ui.forElements

// update
update.register

// read
read.register

// boot
boot.engine
```

### Usage

The idea behind the Girders Elements framework is to have **elements** that can be driven by the back-end. An element is represented in JSON format

```javascript
{
  "kind": ["teaser", "default"],
  "imageUrl": "http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg"
  "title": "Sherlock Holmes"
}
```

The element is identified by its **kind**. We can register the UI of the element for a certain kind, which then makes this element available for representing in the app.

#### UI

The UI of an element can be any React component that takes two props: `element` and `dispatch`.
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

##### Rendering (Lookup) of an Element

Rendering an element is done via the **ui.forElement** or **ui.forElements** methods. Lets say that the model that drives your UI is in the store represented like the example [above](#usage). In case we do:
```javascript
ui.forElement({
  "kind": ["teaser", "default"],
  "imageUrl": "http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg"
  "title": "Sherlock Holmes"
})
```
Then this will return us the **registered** component with kind `['teaser', 'default']`.

##### Canonical Resolution

We can also do the following:
```javascript
ui.forElement({
  "kind": ["teaser", "default", "top"],
  "imageUrl": "http://spyhollywood.com/wp-content/uploads/2016/06/sherlock.jpg"
  "title": "Sherlock Holmes",
  "topStoryColor": "red"
})
```
Notice that the element kind is more specific, `['teaser', 'default', 'red']`. If we haven't registered such an element, its still not a problem, because canonical resolution is done. There is already a element registered for `['teaser', 'default']`, and this element will be rendered. In case we implement a new element, with the more specific kind `['teaser', 'default', 'red']`, and register it, then, of course that element will be returned. This canonical resolution is very useful, in case you introduce new features, but don't want to break clients that are still using older version of registered elements.

##### Rendering Children

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

##### Dispatching Actions

An action is just a string identifying what needs to be performed on the state. When one triggers an action, one can also supply additional parameters (payload) to the action that will be provided later on to the update.

The dispatch prop is used to dispatch an action. Actions can be
- local - meaning that the action will be handled by an updater for the element from which it was dispatched
- global - meaning that the action will be handled by an updater for the action that is either registered for the element from which the action was dispatched, or some of its parents

Global actions are identified by starting dot in the action type (for now, might change in near future)

#### Update

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

#### Read

##### Transformers

#### Engine

