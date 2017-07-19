'use strict';

import { mount } from 'enzyme';

import React from 'react';
import { fromJS } from 'immutable';
import { ui, read, Engine } from '..';


describe('Reads', () => {

  const appStateWithMetadata = {
    kind: 'app',
    content: {
      kind: ['__read', 'scene'],
      uri: 'https://netcetera.com/test.json',
      where: ['children', 'metadata']
    }
  };

  const serverResponse = {
    metadata: {
      title: 'Scene title'
    },
    children: [
      {
        kind: 'widget'
      },
      {
        kind: 'widget'
      }
    ]
  }
  beforeEach(() => {
    ui.register('app', ({ uiFor }) => {
      return (
        <div>{uiFor('content')}</div>
      );
    });
    ui.register('scene', () => {
      return (
        <div>Scene</div>
      );
    });
    read.register(/test\.json$/, () => Promise.resolve( { value: serverResponse }));
  });

  afterEach(() => {
    ui.reset();
  });

  it('should succeed when found proper response with metadata', done => {
    const engine = mount(<Engine initState={fromJS(appStateWithMetadata)} />);
    let html = engine.html();
    expect(html).toMatch('loading...');
    expect(html).not.toMatch('Scene');

    setTimeout(() => {
      html = engine.html();
      expect(html).not.toMatch('loading...');
      expect(html).toMatch('Scene');
      expect(engine.state().store.getState().getIn(['content', 'metadata', 'title'])).toEqual("Scene title")
      done();
    }, 500);
  });

});
