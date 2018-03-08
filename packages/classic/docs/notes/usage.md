# Using Skele

# Hello World

## Importing

    import { ui } from '@skele/classic';

    import skele from '@skele/classic';
    // what's inside
    skele.ui
    skele.read
    skele.update

# Element UI

An element UI can be any React component that takes two props: `element` and `dispatch`.
It is registered using:

    ui.register(<element kind>, <element>)

e.g.

    UI.register('teaser', ({ element, dispatch }) => {
      return (
        <View>
          <TouchableOpacity onPress={dispatch('ACTION_TYPE')} />
        </View>
      )
    })

## Rendering children

Any element can render a sub element by:

    UI.register(['navigation', 'stack'], ({ element, dispatch }) => {
      return (
        <View>
          {ui.forElement(element.get('children').last())}
        </View>
      )
    })

A list of children can be rendered using:

    UI.register(['article'], ({ element, dispatch }) => {
      return (
        <View>
          {ui.forElements(element.get('children'))}
        </View>
      )
    })

## Dispatching Updates

The dispatch prop is used to dispatch an action. The action is identified by a simple string and its "namespace" is
local to the element itself.

It is not required that an update is registered for that specific action for the element. A container is able to
"catch" an action using pattern matching.

    UI.register('teaser', ({  element, dispatch }) => {
      return (
        <View>
          <TouchableOpacity onPress={dispatch('ACTION_TYPE')} />
        </View>
      )
    })

# Actions, Updates, Sagas

An action is just a string identifying what needs to be performed on the state. When one triggers an action, one can
also supply additional parameters (payload) to the action that will be provided later on to the update or saga.

## Updates

Updates are registered in a similar way ui is registered, by using the element kind.

    // update.register([any(), ofKind(['teaser']), 'bla']


    updates.register('teaser'), (update, saga) => {
      update('bla', element => element.set('bla', 1))
      update('foo', element => element.set('foo', 2))

      saga('x', function* () {
        yield put(loading())


      })
    }

    updates.register(['navigation',  'stack']), (update, saga) => {
      // to be implemented in future
      update([seq(any(), kindOf('teaser'), 'pop'] (stack, child) => stack.updateIn('children', cs => cs.append(child))
      // to be implemented now
      update('**/pop', stack => stack.updateIn('children', cs => cs.butLast())

      saga('load', function *(url) {
      }
    });

    updates.register([], (update, saga) => {
      saga('read', (el, uri, subPath) => {

        yield dispatch('read/Started', uri, subPath)

        const readFn = reads.readForURI(uir);

        const v = yield call(readFn, uri)

        if ( v == success)
          yield dispatch('read/Finished, uri, subPath, content)
        else
          yield dispatch('read/Error, uri, subPath, content)

      })


      update('read/Started', (el url.
      update('read/Finished',
      update('read/Error'



    const updater = new Updater(initialState, saga)
        .Case('bla'),
        .Case('foo')

    saga = function* () {
      yield* fork(
        takeEvery('x', function* () { })
    }

# Reads

Reads are meant to standardize the way content is "read" into the application state and provide extension points for
transformations.

A read is in essence a saga.

    reads.register(['scene'], ....)

    read.

Invoking Reads:

    1.
    {
      kind: 'scene',
      content: {
        kind: ['__read', 'article'],
        uri: "http://example.com"
      }
    }

    2.
    {
      kind: 'scene',
      content: {
        kind: ['__loading', 'article'],
        uri: "http://example.com"
      }
    }

    3.
    {
      kind: 'scene',
      content: {
        kind: 'article',
        content: [
         //...
        ]
      }
    }

    4. error state

    {
      kind: 'scene',
      content: {
        kind: ['__error', 404, 'artcile],
        message: "blkbklbkbkbk"
      }
    }



    dispatch('read', "http://example.com", 'content', 'article')
    dispatch({
        type: 'READ',
        uri: 'http://example.com',
        where: 'content',
        kind: ['article']
    })

## Transformers

# Organizing an element

# Configuration

# Engine
