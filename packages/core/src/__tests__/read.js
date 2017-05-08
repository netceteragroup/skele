'use strict';

import { mount } from 'enzyme';

import React from 'react';
import { fromJS } from 'immutable';
import { ui, read, Engine } from '..';


describe('Reads', () => {

  const appState = {
    kind: 'app',
    content: {
      kind: ['__read', 'scene'],
      uri: 'https://netcetera.com/test.json',
      where: 'children'
    }
  };

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
    read.register(/test\.json$/, u => Promise.resolve({value: {kind: 'scene'}, meta: read.responseMeta({url: u})}));

  });

  afterEach(() => {
    ui.reset();
  });

  it('should succeed when found proper response', done => {
    const engine = mount(<Engine initState={fromJS(appState)} />);
    let html = engine.html();
    expect(html).toMatch('loading...');
    expect(html).not.toMatch('Scene');

    setTimeout(() => {
      html = engine.html();
      expect(html).not.toMatch('loading...');
      expect(html).toMatch('Scene');
      done();
    }, 500);
  });

});
