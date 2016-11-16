'use strict';

import { expect } from '../support/utils';
import I from 'immutable';
import { isOfKind } from '../../src/common/element';

describe('element', function() {

  it('properly resolves element kinds', function() {
    const emptyKind = I.fromJS({
      'kind': []
    });
    const stringKind = I.fromJS({
      'kind': 'component'
    });
    const singleKind = I.fromJS({
      'kind': ['component']
    });
    const doubleKind = I.fromJS({
      'kind': ['component', 'test']
    });
    const tripleKind = I.fromJS({
      'kind': ['component', 'test', 'detail']
    });

    expect(isOfKind('component', stringKind)).to.equal(true);
    expect(isOfKind(['component'], stringKind)).to.equal(true);
    expect(isOfKind(['component'], singleKind)).to.equal(true);
    expect(isOfKind(['component'], doubleKind)).to.equal(true);
    expect(isOfKind(['component', 'test'], doubleKind)).to.equal(true);
    expect(isOfKind(['component'], tripleKind)).to.equal(true);
    expect(isOfKind(['component', 'test'], tripleKind)).to.equal(true);
    expect(isOfKind(['component', 'test', 'detail'], tripleKind)).to.equal(true);

    expect(isOfKind('component', emptyKind)).to.equal(false);
    expect(isOfKind('', emptyKind)).to.equal(false);
    expect(isOfKind(['unknown'], stringKind)).to.equal(false);
    expect(isOfKind(['component', 'test'], singleKind)).to.equal(false);
    expect(isOfKind(['test'], doubleKind)).to.equal(false);
    expect(isOfKind(['component', 'test', 'detail'], doubleKind)).to.equal(false);
    expect(isOfKind(['detail'], tripleKind)).to.equal(false);
    expect(isOfKind(['component', 'test', 'detail', 'unknown'], tripleKind)).to.equal(false);
  });

});