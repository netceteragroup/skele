'use strict';

import { fromJS } from 'immutable';
import { transform, read } from '..';
import TreeZipper from '../zip/TreeZipper'

import R from 'ramda';

describe('Transformers', () => {

  const appState = {
    kind: 'app',
    canonicalUrl: 'https://someurl.com',
    content: [
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description'
        }
      }]
  };

  afterEach(() => {
    transform.reset();
  });

  it('should register and apply transformers', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    transform.register(['app'], element => element.set('canonicalUrl', 'http://newurl.com'))

    const transformedAppState = transform.apply(fromJS(appState)).value()
    expect(transformedAppState.get('canonicalUrl')).toEqual('http://newurl.com')
    expect(transformedAppState.getIn(['content'])[0].getIn(['metadata', 'title'])).toEqual('Home page')
  })

  it('should register multiple transformers per same kind', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Override title'))
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Actual override title'))

    expect(transform.get(['scene']).length).toEqual(2)
  });

  it('should register and apply multiple transfromers per kind', () => {
    transform.register(['scene'], element => element.setIn(['metadata', 'title'], 'Home page'))
    transform.register(['scene'], element => element.setIn(['metadata', 'description'], 'Home page description'))

    const transformedAppState = transform.apply(fromJS(appState)).value()

    // does not know how to traverse the children if the array is immutable
    expect(transformedAppState.getIn(['content'])[0].getIn(['metadata', 'title'])).toEqual('Home page')
    expect(transformedAppState.getIn(['content'])[0].getIn(['metadata', 'description'])).toEqual('Home page description')
  })

});
