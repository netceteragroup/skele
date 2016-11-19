'use strict';

import { expect } from './support/utils';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import update from '../src/update';

describe('Updates', function() {

  it('registers an update', function() {
    const action1 = {
      fromKind: ['article', 'specific'],
      type: 'TOGGLE_BOOKMARK'
    };
    const action2 = {
      fromKind: ['article'],
      type: '.LOAD'
    };

    update.register(action1.fromKind, elementRegistry => {
      elementRegistry.register(action1.type, () => {});
    });
    update.register(action2.fromKind, elementRegistry => {
      elementRegistry.register(action2.type, () => {});
    });
    update.register(action2.fromKind, elementRegistry => {
      elementRegistry.register(action2.type, () => {});
    });
    expect(update.forAction(action1)).to.exist;
    expect(update.forAction(action2)).to.exist;
    expect(update.forAction({ fromKind: 'unknown' })).not.to.exist;

    update.register(action1.fromKind, elementRegistry => {
      elementRegistry.register(action1.type, null);
    });
    update.register(action2.fromKind, elementRegistry => {
      elementRegistry.register(action2.type, null);
    });
    expect(update.forAction(action1)).not.to.exist;
    expect(update.forAction(action2)).not.to.exist;
  });

  it('returns a cursor upon invocation of the reducer function', function() {
    const data = fromJS({
      element1: {
        element2: {
          element3: {
            kind: ['article', 'specific']
          },
          kind: ['container']
        },
        kind: ['container']
      }
    });
    const cursor = Cursor.from(data, ['element1'], () => {});
    const localUpdate = {
      fromKind: ['article', 'specific'],
      fromPath: ['element2', 'element3'],
      type: 'TOGGLE_BOOKMARK'
    };
    const globalUpdate = {
      fromKind: ['container'],
      fromPath: [],
      type: '.TOGGLE_BOOKMARK'
    };
    const readUpdate = {
      fromKind: ['container'],
      fromPath: [],
      type: 'READ'
    };
    update.register(localUpdate.fromKind, elementRegistry => {
      elementRegistry.register(localUpdate.type, () => {});
    });
    update.register(globalUpdate.fromKind, elementRegistry => {
      elementRegistry.register(globalUpdate.type, () => {});
    });
    update.register(readUpdate.fromKind, elementRegistry => {
      elementRegistry.register(readUpdate.type, () => {});
    });

    expect(update.reducer(cursor, {})).to.equal(cursor);
    expect(update.reducer(cursor, localUpdate)).to.exist;
    expect(update.reducer(cursor, globalUpdate)).to.exist;
    expect(update.reducer(cursor, readUpdate)).to.exist;
  });

});
