'use strict';

import invariant from 'invariant';
import { Seq, List } from 'immutable';
import Cursor from 'immutable/contrib/cursor'

import { ancestorKinds } from '../common/element';

import { forAction, forKindAndType } from './';

import readReducer from '../read/reducer';

/**
 * Main application reducer.
 *
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export default function(cursor, action) {
  // console.log('Reducer: action:', action);
  invariant(
    cursor != null && cursor._keyPath != null,
    "The reducer is meant to work only with cursors");

  const fromKind = action.fromKind;
  const fromPath = action.fromPath;
  if (fromKind && fromPath) {
    const type = action.type;

    // handle reads
    if (type.startsWith('READ')) {
      return readReducer(cursor, action);
    }

    // handle global updates
    if (type.startsWith('.')) {
      const resultFromLookup = parents(cursor.getIn(fromPath))
        .filter(parent => !!parent.get('kind'))
        .map(parent => {
          const parentKind = parent.get('kind');
          const updatesPerAncestor = ancestorKinds(parentKind)
            .map(ancestorKind => forKindAndType(ancestorKind, type))
            .filter(update => !!update);
          return {
            element: parent,
            update: updatesPerAncestor.first()
          }
        })
        .filter(parent => !!parent.update)
        .first();
      if (resultFromLookup) {
        const { element, update } = resultFromLookup;
        if (element && update) {
          return cursor.setIn(element._keyPath, update(element.deref(), action)).set('LAST_KEY_PATH', action.fromPath).set('LAST_KIND', action.fromKind);
        }
      }
      return cursor.set('LAST_KEY_PATH', action.fromPath).set('LAST_KIND', action.fromKind);
    }

    // handle local updates
    const update = forAction(action);
    if (update) {
      const element = cursor.getIn(fromPath);
      return cursor.setIn(fromPath, update(element.deref(), action)).set('LAST_KEY_PATH', action.fromPath).set('LAST_KIND', action.fromKind);
    }

  }
  return cursor.set('LAST_KEY_PATH', action.fromPath).set('LAST_KIND', action.fromKind);
}

/**
 * Gets the parent value of this cursor. returns null if this is the root cursors.
 */
function parent(cursor: any): any {
  if (cursor == null) {
    return null;
  }

  const root = cursor._rootData;
  const onChange = cursor._onChange;
  const keyPath = cursor._keyPath;

  if (keyPath.length === 0) {
    return null; // root
  }

  const newPath = keyPath.slice(0, -1);

  return Cursor.from(root, newPath, onChange);
}

/**
 * Gets a Seq of all the parents (self first, then parent, ...) of this cursor. The Seq is lazy.
 */
function parents(cursor: any): Seq {
  if (cursor == null) {
    return List();
  }

  const self = cursor;

  function* _ancestors() {
    let current = self;

    while (current != null) {
      yield current;
      current = parent(current);
    }
  }

  return Seq(_ancestors());
}
