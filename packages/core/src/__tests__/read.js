'use strict';

import { mount } from 'enzyme';

import React from 'react';
import { fromJS } from 'immutable';
import { ui, read, data, Engine } from '..';
const { isOfKind } = data.element;

describe('Reads', () => {

  const appState = {
    kind: 'app',
    content: {
      kind: ['__read', 'scene'],
      uri: 'https://netcetera.com/test.json'
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
    read.register(/test\.json$/, u => Promise.resolve({value: {kind: 'scene', title: 'Scene Title'}, meta: read.responseMeta({url: u})}));

  });

  afterEach(() => {
    ui.reset();
  });

  it('should succeed when found proper response', done => {
    const engine = mount(<Engine initState={fromJS(appState)} />);
    const loadingEls = engine.findWhere(c => isOfKind('__loading', c.prop('element')));
    expect(loadingEls.length).toBeGreaterThan(0);

    let html = engine.html();
    expect(html).toMatch('loading...');
    expect(html).not.toMatch('Scene');

    setTimeout(() => {
      const scenes = engine.findWhere(c => isOfKind('scene', c.prop('element')));
      expect(scenes.length).toBeGreaterThan(0);

      const scene = scenes.first();
      expect(scene.prop('element').get('title')).toEqual('Scene Title');
      done();
    }, 500);
  });

});
