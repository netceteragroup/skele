'use strict';

import { expect } from '../support/utils';
import { List, Seq, fromJS } from 'immutable';
import { isOfKind, canonical } from '../../src/common/element';

describe('element', function() {

  it('properly resolves element kinds', function() {
    const emptyKind = fromJS({
      'kind': []
    });
    const stringKind = fromJS({
      'kind': 'component'
    });
    const singleKind = fromJS({
      'kind': ['component']
    });
    const doubleKind = fromJS({
      'kind': ['component', 'test']
    });
    const tripleKind = fromJS({
      'kind': ['component', 'test', 'detail']
    });

    expect(isOfKind('component', stringKind)).to.equal(true);
    expect(isOfKind(['component'], stringKind)).to.equal(true);
    expect(isOfKind([], singleKind)).to.equal(true);
    expect(isOfKind(['component'], singleKind)).to.equal(true);
    expect(isOfKind(['component'], doubleKind)).to.equal(true);
    expect(isOfKind(['component', 'test'], doubleKind)).to.equal(true);
    expect(isOfKind(['component'], tripleKind)).to.equal(true);
    expect(isOfKind(['component', 'test'], tripleKind)).to.equal(true);
    expect(isOfKind(['component', 'test', 'detail'], tripleKind)).to.equal(true);

    expect(isOfKind('component', null)).to.equal(false);
    expect(isOfKind('component', emptyKind)).to.equal(false);
    expect(isOfKind('', emptyKind)).to.equal(false);
    expect(isOfKind(['unknown'], stringKind)).to.equal(false);
    expect(isOfKind(['component', 'test'], singleKind)).to.equal(false);
    expect(isOfKind(['test'], doubleKind)).to.equal(false);
    expect(isOfKind(['component', 'test', 'detail'], doubleKind)).to.equal(false);
    expect(isOfKind(['detail'], tripleKind)).to.equal(false);
    expect(isOfKind(['component', 'test', 'detail', 'unknown'], tripleKind)).to.equal(false);
  });

  it('properly normalizes element kinds', function() {
    expect(canonical(null)).to.equal(null);
    expect(canonical(true)).to.equal(null);
    expect(canonical('component')).to.equal(List.of('component'));
    expect(canonical(['component', 'test'])).to.equal(List.of('component', 'test'));
    expect(canonical(List.of('component', 'test'))).to.equal(List.of('component', 'test'));
    expect(canonical(Seq.of('component'))).to.equal(List.of('component'));
  });

});