'use strict';

import { expect } from '../support/utils';
import { List, Seq, fromJS } from 'immutable';
import { isOfKind, isExactlyOfKind, kindOf, ancestorKinds, canonical } from '../../src/common/element';

describe('element', function() {

  it('properly checks for element kinds', function() {
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

  it('properly checks for exact element kinds', function() {
    const element = fromJS({
      'kind': ['component', 'test']
    });

    expect(isExactlyOfKind(null, null)).to.equal(false);
    expect(isExactlyOfKind(['component'], element)).to.equal(false);
    expect(isExactlyOfKind(['component', 'test'], element)).to.equal(true);
  });

  it('returns the element kind', function() {
    const kind = ['component', 'test'];
    const element1 = fromJS({
      'kind': null
    });
    const element2 = fromJS({
      'kind': kind
    });

    expect(kindOf(element1)).to.equal(null);
    expect(kindOf(element2)).to.equal(List(kind));
  });

  it('returns the ancestor kinds', function() {
    const kinds = ['component', 'test', 'detail'];
    const ancestors = Seq.of(
      List.of('component', 'test', 'detail'),
      List.of('component', 'test'),
      List.of('component')
    );

    expect(ancestorKinds([])).to.equal(List());
    expect(ancestorKinds('component')).to.equal(Seq.of(List.of('component')));
    expect(ancestorKinds(kinds)).to.equal(ancestors);
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