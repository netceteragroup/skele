'use strict';

import invariant from 'invariant';
import { Seq, List } from 'immutable';
import Cursor from 'immutable/contrib/cursor'

import { ancestorKinds, isExactlyOfKind } from '../common/element';
import { isSubclassOf } from '../common/classes';

import { forAction, forKindAndType } from './';

/**
 * Main application reducer.
 *
 * @param cursor The cursor representing the state.
 * @param action The action.
 * @returns {*} The new state represented by updated cursor.
 */
export default function(cursor, action) {
  invariant(
    cursor != null && cursor._keyPath != null,
    "The reducer is meant to work only with cursors");

  const kind = action.kind;
  const path = action.path;
  if (kind && path) {
    const type = action.type;

    // handle global updates
    if (type.startsWith('.')) {
      const { element, update } = parents(cursor.getIn(path))
        .filter(parent => !!parent.get('kind'))
        .map(parent => {
          const parentKind = parent.get('kind').toJS();
          const updatesPerAncestor = ancestorKinds(parentKind)
            .map(ancestorKind => forKindAndType(ancestorKind.toJS(), type))
            .filter(update => !!update);
          return {
            element: parent,
            update: updatesPerAncestor.first()
          }
        })
        .filter(parent => !!parent.update)
        .first();
        if (element && update) {
          return cursor.setIn(element._keyPath, update(element.deref(), action));
        }
    }

    // handle local updates
    const update = forAction(action);
    if (update) {
      const element = cursor.getIn(path);
      return cursor.setIn(path, update(element.deref(), action));
    }

  }
  return cursor;
};

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
