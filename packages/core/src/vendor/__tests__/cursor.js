/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fromJS, is, Map, List, Record } from 'immutable'
import Cursor from '../cursor'

describe('Cursor', () => {
  var json = { a: { b: { c: 1 } } }

  it('gets from its path', () => {
    var data = fromJS(json)
    var cursor = Cursor.from(data)

    expect(cursor.deref()).toBe(data)

    var deepCursor = cursor.cursor(['a', 'b'])
    expect(deepCursor.deref().toJS()).toEqual(json.a.b)
    expect(deepCursor.deref()).toBe(data.getIn(['a', 'b']))
    expect(deepCursor.get('c')).toBe(1)

    var leafCursor = deepCursor.cursor('c')
    expect(leafCursor).toBe(1)

    var missCursor = deepCursor.cursor('d')
    expect(missCursor).toBe(undefined)
  })

  it('gets return new cursors', () => {
    var data = fromJS(json)
    var cursor = Cursor.from(data)
    var deepCursor = cursor.getIn(['a', 'b'])
    expect(deepCursor.deref()).toBe(data.getIn(['a', 'b']))
  })

  it('gets return new cursors using List', () => {
    var data = fromJS(json)
    var cursor = Cursor.from(data)
    var deepCursor = cursor.getIn(fromJS(['a', 'b']))
    expect(deepCursor.deref()).toBe(data.getIn(fromJS(['a', 'b'])))
  })

  it('cursor return new cursors of correct type', () => {
    var data = fromJS({ a: [1, 2, 3] })
    var cursor = Cursor.from(data)
    var deepCursor = cursor.cursor('a')
    expect(deepCursor.findIndex).toBeDefined()
  })

  it('can be treated as a value', () => {
    var data = fromJS(json)
    var cursor = Cursor.from(data, ['a', 'b'])
    expect(cursor.toJS()).toEqual(json.a.b)
    expect(cursor).toValueEqual(data.getIn(['a', 'b']))
    expect(cursor.size).toBe(1)
    expect(cursor.get('c')).toBe(1)
  })

  it('returns the actual value if the position is not a collection', () => {
    var data = Map({ a: 'A' })
    var aCursor = Cursor.from(data, 'a')
    expect(aCursor).toBe('A')
  })

  it('updates at its path', () => {
    var data = fromJS(json)
    var aCursor = Cursor.from(data, 'a')

    var deepCursor = aCursor.cursor(['b'])
    expect(deepCursor.deref()).toValueEqual(fromJS({ c: 1 }))

    // cursor edits return new cursors:
    var newDeepCursor = deepCursor.update(x => 2)
    expect(newDeepCursor).toBe(2)

    // meanwhile, data is still immutable:
    expect(data.toJS()).toEqual(json)
  })

  it('has map API for update shorthand', () => {
    var data = fromJS(json)
    var aCursor = Cursor.from(data, 'a')
    var bCursor = aCursor.cursor('b')
    var cCursor = bCursor.cursor('c')

    expect(bCursor.set('c', 10).deref()).toValueEqual(fromJS({ c: 10 }))
  })

  it('returns undefined if there is nothing under the path', () => {
    var data = Map()
    var cursor = Cursor.from(data, ['a', 'b', 'c'])
    expect(cursor).toBeUndefined()
  })

  it('has the sequence API', () => {
    var data = Map({ a: 1, b: 2, c: 3 })
    var cursor = Cursor.from(data)
    expect(cursor.map(x => x * x)).toValueEqual(Map({ a: 1, b: 4, c: 9 }))
  })

  it('can push values on a List', () => {
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'])

    expect(cursor.push(3, 4)).toValueEqual(List([0, 1, 2, 3, 4]))
  })

  it('can pop values of a List', () => {
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'])

    expect(cursor.pop()).toValueEqual(List([0, 1]))
  })

  it('can unshift values on a List', () => {
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'])

    expect(cursor.unshift(-2, -1)).toValueEqual(List([-2, -1, 0, 1, 2]))
  })

  it('can shift values of a List', () => {
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'])

    expect(cursor.shift()).toValueEqual(List([1, 2]))
  })

  it('returns wrapped values for sequence API', () => {
    var data = fromJS({ a: { v: 1 }, b: { v: 2 }, c: { v: 3 } })
    var cursor = Cursor.from(data)

    var found = cursor.find(map => map.get('v') === 2)
    expect(typeof found.deref).toBe('function') // is a cursor!
  })

  it('returns wrapped values for iteration API', () => {
    var jsData = [{ val: 0 }, { val: 1 }, { val: 2 }]
    var data = fromJS(jsData)
    var cursor = Cursor.from(data)
    cursor.forEach(function(c, i) {
      expect(typeof c.deref).toBe('function') // is a cursor!
      expect(c.get('val')).toBe(i)
    })
  })

  it('can map over values to get subcursors', () => {
    var data = fromJS({ a: { v: 1 }, b: { v: 2 }, c: { v: 3 } })
    var cursor = Cursor.from(data)

    var mapped = cursor
      .map(val => {
        expect(typeof val.deref).toBe('function') // mapped values are cursors.
        return val
      })
      .toMap()
    // Mapped is not a cursor, but it is a sequence of cursors.
    expect(typeof mapped.deref).not.toBe('function')
    expect(typeof mapped.get('a').deref).toBe('function')

    // Same for indexed cursors
    var data2 = fromJS({ x: [{ v: 1 }, { v: 2 }, { v: 3 }] })
    var cursor2 = Cursor.from(data2)

    var mapped2 = cursor2
      .get('x')
      .map(val => {
        expect(typeof val.deref).toBe('function') // mapped values are cursors.
        return val
      })
      .toList()
    // Mapped is not a cursor, but it is a sequence of cursors.
    expect(typeof mapped2.deref).not.toBe('function')
    expect(typeof mapped2.get(0).deref).toBe('function')
  })

  it('can have mutations apply with a single callback', () => {
    var data = fromJS({ a: 1 })

    var c1 = Cursor.from(data)
    var c2 = c1.withMutations(m =>
      m
        .set('b', 2)
        .set('c', 3)
        .set('d', 4)
    )

    expect(c1.deref().toObject()).toEqual({ a: 1 })
    expect(c2.deref().toObject()).toEqual({ a: 1, b: 2, c: 3, d: 4 })
  })

  it('maintains indexed sequences', () => {
    var data = fromJS([])
    var c = Cursor.from(data)
    expect(c.toJS()).toEqual([])
  })

  it('properly acts as an iterable', () => {
    var data = fromJS({ key: { val: 1 } })
    var c = Cursor.from(data).values()
    var c1 = c.next().value.get('val')
    expect(c1).toBe(1)
  })

  it('can update deeply', () => {
    var data = fromJS({ a: { b: { c: 1 } } })
    var c = Cursor.from(data, ['a'])
    var c1 = c.updateIn(['b', 'c'], x => x * 10)
    expect(c1.getIn(['b', 'c'])).toBe(10)
  })

  it('can set deeply', () => {
    var data = fromJS({ a: { b: { c: 1 } } })
    var c = Cursor.from(data, ['a'])
    var c1 = c.setIn(['b', 'c'], 10)
    expect(c1.getIn(['b', 'c'])).toBe(10)
  })

  it('can get Record value as a property', () => {
    var User = Record({ name: 'John' })
    var users = List.of(new User())
    var data = Map({ users: users })
    var cursor = Cursor.from(data, ['users'])
    expect(cursor.first().name).toBe('John')
  })
})
