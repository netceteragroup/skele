'use strict';

import { expect } from '../support/utils';
import { List, fromJS } from 'immutable';

import Registry from '../../src/common/Registry';

describe('Registry', () => {

  it('can be created and used in key-value (map) fashion', () => {
    const registry = new Registry();

    expect(registry.get('detective')).to.equal(undefined);

    registry.register('detective', 'Sherlock Holmes');
    expect(registry.get('detective')).to.equal('Sherlock Holmes');
  });

  describe('is internally', () => {

    it('adapting keys into list', () => {
      const registry = new Registry();

      // test fails because of toString method not present on 'undefined', invoked by chai-immutable in assert method
      // expect(registry._adaptKey()).to.not.equal(undefined);

      expect(registry._adaptKey()).to.equal(List.of(undefined));
      expect(registry._adaptKey('teaser')).to.equal(List.of('teaser'));
      expect(registry._adaptKey(['teaser'])).to.equal(List.of('teaser'));
      expect(registry._adaptKey(['teaser', 'top'])).to.equal(List.of('teaser', 'top'));
      expect(registry._adaptKey(List.of('teaser', 'top'))).to.equal(List.of('teaser', 'top'));
    });

    it('searching by specificity', () => {
      const registry = new Registry();

      expect(registry._getBySpecificity(List.of('teaser'), true)).to.equal(undefined);

      registry.register('teaser', 'teaserValue');

      expect(registry._getBySpecificity(List.of('teaser'), true)).to.equal('teaserValue');
      expect(registry._getBySpecificity(List.of('teaser', 'top'), true)).to.equal('teaserValue');
      expect(registry._getBySpecificity(List.of('banner'), true)).to.equal(undefined);
    });

    it('searching with recognizer', () => {
      const registry = new Registry();

      expect(registry._getWithRecognizer(List.of('special-image'))).to.equal(undefined);

      const recognizer = (key) => key.first().indexOf('image') !== -1;

      registry.register(recognizer, 'imageValue');

      expect(registry._getWithRecognizer(List.of('special-image'))).to.equal('imageValue');
    });

  });

  describe('gets values', () => {
    it('by specificity first', () => {
      const registry = new Registry();

      registry.register('teaser', 'teaserBySpecValue');
      registry.register((key) => key.first() === 'teaser', 'teaserByRecoValue');

      /*
       * We try to get [teaser,top] here. We have registered by specificity [teaser],
       * and by recognizer function. Since we are searching with useSpecificity on,
       * we should get the value with Spec
       */
      expect(registry.get(['teaser', 'top'], true)).to.equal('teaserBySpecValue');
    });

    it('by recognizer if specificity not found', () => {
      const registry = new Registry();

      registry.register('teaser', 'teaserBySpecValue');
      registry.register((key) => key.first() === 'teaser', 'teaserByRecoValue');

      /*
       * Here we use (useSpecificity off), so we should get the value
       * returned by going with recognizer
       */
      expect(registry.get(['teaser', 'top'], false)).to.equal('teaserByRecoValue');
    });
  });

  it("can be reset", () => {
    const registry = new Registry();

    registry.register('teaser', 'teaserBySpecValue');
    registry.register((key) => key.first() === 'teaser', 'teaserByRecoValue');

    registry.reset();

    expect(registry.get(['teaser', 'top'])).not.to.exist;
  });

  it("can be created with key extractor and elements driven (get) by data", () => {
    const registry = new Registry(element => element.get('kind'));
    const elementModel = fromJS({
      kind: 'teaser',
      value: 'a teaser'
    });

    registry.register('teaser', 'teaserView');
    const result = registry.get(elementModel);

    expect(result).to.equal('teaserView');
  });
});

