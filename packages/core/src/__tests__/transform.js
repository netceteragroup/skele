'use strict';

import { fromJS } from 'immutable';
import { transform } from '..';

describe('Transformers', () => {

  const appState = {
    kind: 'app',
    url: 'https://someurl.com',
    content:
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description'
        }
      }
  };

  const appStateMultiScene = {
    kind: 'app',
    url: 'https://someurl.com',
    content: [
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description'
        }
      },
      {
        kind: ['scene'],
        metadata: {
          title: 'Title2',
          description: 'Description2'
        }
      }
    ]
  };

  const appStateMultiSceneWithSubElements = {
    kind: 'app',
    url: 'https://someurl.com',
    content: [
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description'
        },
        content: {
          kind: 'widget',
          title: 'Widget Title'
        }
      },
      {
        kind: ['scene'],
        metadata: {
          title: 'Title2',
          description: 'Description2'
        },
        content: [
          {
            kind: 'widget',
            title: 'Widget Title 1'
          },
          {
            kind: 'widget',
            title: 'Widget Title 2'
          }
        ]
      }
    ]
  };

  const appStateCustomChildrenElements = {
    kind: 'app',
    url: 'https://someurl.com',
    children: [
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description'
        }
      },
      {
        kind: ['scene'],
        metadata: {
          title: 'Title2',
          description: 'Description2'
        }
      }
    ]
  };

  afterEach(() => {
    transform.reset();
  });

  it('should register multiple transformers per same kind', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Override title'))
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Actual override title'))

    expect(transform.get(['scene']).length).toEqual(2)
  });

  it('should register and apply transformers with single scene', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    transform.register(['app'], element => element.set('url', 'http://newurl.com'))

    const transformedAppState = transform.apply(fromJS(appState)).value()

    expect(transformedAppState.get('url')).toEqual('http://newurl.com')
    expect(transformedAppState.getIn(['content', 'metadata', 'title'])).toEqual('Home page')
  })

  it('should register and apply transformers with multiple scenes', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    transform.register(['app'], element => element.set('url', 'http://newurl.com'))

    const transformedAppState = transform.apply(fromJS(appStateMultiScene)).value()

    expect(transformedAppState.get('url')).toEqual('http://newurl.com')
    expect(transformedAppState.getIn(['content', 0, 'metadata', 'title'])).toEqual('Home page')
    expect(transformedAppState.getIn(['content', 1, 'metadata', 'title'])).toEqual('Home page')
  })


  it('should register and apply multiple transfromers per kind', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    transform.register(['scene'], element => element.setIn(['metadata', 'description'], 'Home page description'))

    const transformedAppState = transform.apply(fromJS(appState)).value()

    expect(transformedAppState.getIn(['content', 'metadata', 'title'])).toEqual('Home page')
    expect(transformedAppState.getIn(['content', 'metadata', 'description'])).toEqual('Home page description')
  })

  it('should register and apply transformers for multiple scenes with widgets', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    transform.register(['app'], element => element.set('url', 'http://newurl.com'))
    transform.register(['widget'], element => element.set('title', 'New ' +  element.get('title')))


    const transformedAppState = transform.apply(fromJS(appStateMultiSceneWithSubElements)).value()

    expect(transformedAppState.getIn(['content', 0, 'metadata', 'title'])).toEqual('Home page')
    expect(transformedAppState.getIn(['content', 0, 'content', 'title'])).toEqual('New Widget Title')
    expect(transformedAppState.getIn(['content', 1, 'content', 0, 'title'])).toEqual('New Widget Title 1')
    expect(transformedAppState.getIn(['content', 1, 'content', 1, 'title'])).toEqual('New Widget Title 2')
  })

  it('should register and apply transformers for non-default ', () => {
    const childrenElements = 'children'
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    const transformedAppState = transform.apply(fromJS(appStateCustomChildrenElements), childrenElements).value()
    expect(transformedAppState.getIn(['children', 0, 'metadata', 'title'])).toEqual('Home page')
  })
});
