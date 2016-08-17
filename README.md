# girders-elements

[![Build Status](https://travis-ci.org/netceteragroup/girders-elements.svg?branch=master)](https://travis-ci.org/netceteragroup/girders-elements)

Girders Elements is an architectural framework that assists building **data-driven** apps with **[React](https://facebook.github.io/react/)** or **[React Native](https://facebook.github.io/react-native/)**.
It is extremely well-suited for creating highly **dynamic UI**s, that are driven from back-end systems (like Content Management Systems).

It uses **[redux](http://github.com/reactjs/redux)** for managing the state of the application. All great tools around the redux eco-system can be leveraged, because `girders-elements` is built on top of it.
**[Immutable](https://facebook.github.io/immutable-js/)** data structures are used for redux's single store and also when using `girders-elements` core features.

### Installation

```
npm install --save girders-elements
```

### Importing

```javascript
import { ui } from 'girders-elements';
// equivalent with
import ui from 'elements/ui';

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

The idea behind the Girders Elements framework is to have `elements` that can be driven by the back-end. An element is represented in JSON format

```javascript
{
  "kind": ["teaser", "default"],
  "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Holmes_-_Steele_1903_-_The_Empty_House_-_The_Return_of_Sherlock_Holmes.jpg"
  "title": "Sherlock at Reichenbach Falls"
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

##### Rendering Children

Any element can render a sub-element like o:

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

##### Dispatching Updates

The dispatch prop is used to dispatch an action. Actions can be
- local - meaning that the action will be handled by an updater for the element from which it was dispatched
- global - meaning that the action will be handled by an updater for the action that is either registered for the element from which the action was dispatched, or some of its parents

Global actions are identified by starting dot in the action type (for now, might change in near future)

#### Update

#### Read

##### Transformers

#### Engine

