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
    expect(leafCursor.deref()).toBe(1)

    var missCursor = leafCursor.cursor('d')
    expect(missCursor.deref()).toBe(undefined)
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
    console.log('AAAAA')
    var deepCursor = cursor.getIn(fromJS(['a', 'b']))
    console.log('b')
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

  it('can be value compared to a primitive', () => {
    var data = Map({ a: 'A' })
    var aCursor = Cursor.from(data, 'a')
    expect(aCursor.size).toBe(undefined)
    expect(aCursor.deref()).toBe('A')
    expect(is(aCursor, 'A')).toBe(true)
  })

  it('updates at its path', () => {
    var onChange = jest.fn()

    var data = fromJS(json)
    var aCursor = Cursor.from(data, 'a', onChange)

    var deepCursor = aCursor.cursor(['b', 'c'])
    expect(deepCursor.deref()).toBe(1)

    // cursor edits return new cursors:
    var newDeepCursor = deepCursor.update(x => x + 1)
    expect(newDeepCursor.deref()).toBe(2)
    var call1 = onChange.mock.calls[0]
    expect(call1[0]).toValueEqual(fromJS({ a: { b: { c: 2 } } }))
    expect(call1[1]).toBe(data)
    expect(call1[2]).toEqual(['a', 'b', 'c'])

    var newestDeepCursor = newDeepCursor.update(x => x + 1)
    expect(newestDeepCursor.deref()).toBe(3)
    var call2 = onChange.mock.calls[1]
    expect(call2[0]).toValueEqual(fromJS({ a: { b: { c: 3 } } }))
    expect(call2[1]).toValueEqual(fromJS({ a: { b: { c: 2 } } }))
    expect(call2[2]).toEqual(['a', 'b', 'c'])

    // meanwhile, data is still immutable:
    expect(data.toJS()).toEqual(json)

    // as is the original cursor.
    expect(deepCursor.deref()).toBe(1)
    var otherNewDeepCursor = deepCursor.update(x => x + 10)
    expect(otherNewDeepCursor.deref()).toBe(11)
    var call3 = onChange.mock.calls[2]
    expect(call3[0]).toValueEqual(fromJS({ a: { b: { c: 11 } } }))
    expect(call3[1]).toBe(data)
    expect(call3[2]).toEqual(['a', 'b', 'c'])

    // and update has been called exactly thrice.
    expect(onChange.mock.calls.length).toBe(3)
  })

  it('updates with the return value of onChange', () => {
    var onChange = jest.fn()

    var data = fromJS(json)
    var deepCursor = Cursor.from(data, ['a', 'b', 'c'], onChange)

    onChange.mockReturnValueOnce(undefined)
    // onChange returning undefined has no effect
    var newCursor = deepCursor.update(x => x + 1)
    expect(newCursor.deref()).toBe(2)
    var call1 = onChange.mock.calls[0]
    expect(call1[0]).toValueEqual(fromJS({ a: { b: { c: 2 } } }))
    expect(call1[1]).toBe(data)
    expect(call1[2]).toEqual(['a', 'b', 'c'])

    onChange.mockReturnValueOnce(fromJS({ a: { b: { c: 11 } } }))
    // onChange returning something else has an effect
    newCursor = newCursor.update(x => 999)
    expect(newCursor.deref()).toBe(11)
    var call2 = onChange.mock.calls[1]
    expect(call2[0]).toValueEqual(fromJS({ a: { b: { c: 999 } } }))
    expect(call2[1]).toValueEqual(fromJS({ a: { b: { c: 2 } } }))
    expect(call2[2]).toEqual(['a', 'b', 'c'])

    // and update has been called exactly twice
    expect(onChange.mock.calls.length).toBe(2)
  })

  it('has map API for update shorthand', () => {
    var onChange = jest.fn()

    var data = fromJS(json)
    var aCursor = Cursor.from(data, 'a', onChange)
    var bCursor = aCursor.cursor('b')
    var cCursor = bCursor.cursor('c')

    expect(bCursor.set('c', 10).deref()).toValueEqual(fromJS({ c: 10 }))

    var call1 = onChange.mock.calls[0]
    expect(call1[0]).toValueEqual(fromJS({ a: { b: { c: 10 } } }))
    expect(call1[1]).toBe(data)
    expect(call1[2]).toEqual(['a', 'b', 'c'])
  })

  it('creates maps as necessary', () => {
    var data = Map()
    var cursor = Cursor.from(data, ['a', 'b', 'c'])
    expect(cursor.deref()).toBe(undefined)
    cursor = cursor.set('d', 3)
    expect(cursor.deref()).toValueEqual(Map({ d: 3 }))
  })

  it('can set undefined', () => {
    var data = Map()
    var cursor = Cursor.from(data, ['a', 'b', 'c'])
    expect(cursor.deref()).toBe(undefined)
    cursor = cursor.set('d', undefined)
    expect(cursor.toJS()).toEqual({ d: undefined })
  })

  it('has the sequence API', () => {
    var data = Map({ a: 1, b: 2, c: 3 })
    var cursor = Cursor.from(data)
    expect(cursor.map(x => x * x)).toValueEqual(Map({ a: 1, b: 4, c: 9 }))
  })

  it('can push values on a List', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'], onChange)

    expect(cursor.push(3, 4)).toValueEqual(List([0, 1, 2, 3, 4]))

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: { b: [0, 1, 2, 3, 4] } }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a', 'b'])
  })

  it('can pop values of a List', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'], onChange)

    expect(cursor.pop()).toValueEqual(List([0, 1]))

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: { b: [0, 1] } }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a', 'b'])
  })

  it('can unshift values on a List', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'], onChange)

    expect(cursor.unshift(-2, -1)).toValueEqual(List([-2, -1, 0, 1, 2]))

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: { b: [-2, -1, 0, 1, 2] } }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a', 'b'])
  })

  it('can shift values of a List', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: { b: [0, 1, 2] } })
    var cursor = Cursor.from(data, ['a', 'b'], onChange)

    expect(cursor.shift()).toValueEqual(List([1, 2]))

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: { b: [1, 2] } }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a', 'b'])
  })

  it('returns wrapped values for sequence API', () => {
    var data = fromJS({ a: { v: 1 }, b: { v: 2 }, c: { v: 3 } })
    var onChange = jest.fn()
    var cursor = Cursor.from(data, onChange)

    var found = cursor.find(map => map.get('v') === 2)
    expect(typeof found.deref).toBe('function') // is a cursor!
    found = found.set('v', 20)

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(
      fromJS({ a: { v: 1 }, b: { v: 20 }, c: { v: 3 } })
    )
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['b', 'v'])
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
    var onChange = jest.fn()
    var data = fromJS({ a: 1 })

    var c1 = Cursor.from(data, onChange)
    var c2 = c1.withMutations(m =>
      m
        .set('b', 2)
        .set('c', 3)
        .set('d', 4)
    )

    expect(c1.deref().toObject()).toEqual({ a: 1 })
    expect(c2.deref().toObject()).toEqual({ a: 1, b: 2, c: 3, d: 4 })
    expect(onChange.mock.calls.length).toBe(1)
  })

  it('can use withMutations on an unfulfilled cursor', () => {
    var onChange = jest.fn()
    var data = fromJS({})

    var c1 = Cursor.from(data, ['a', 'b', 'c'], onChange)
    var c2 = c1.withMutations(m =>
      m
        .set('x', 1)
        .set('y', 2)
        .set('z', 3)
    )

    expect(c1.deref()).toEqual(undefined)
    expect(c2.deref()).toValueEqual(fromJS({ x: 1, y: 2, z: 3 }))
    expect(onChange.mock.calls.length).toBe(1)
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
    var onChange = jest.fn()
    var data = fromJS({ a: { b: { c: 1 } } })
    var c = Cursor.from(data, ['a'], onChange)
    var c1 = c.updateIn(['b', 'c'], x => x * 10)
    expect(c1.getIn(['b', 'c'])).toBe(10)

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: { b: { c: 10 } } }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a', 'b', 'c'])
  })

  it('can set deeply', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: { b: { c: 1 } } })
    var c = Cursor.from(data, ['a'], onChange)
    var c1 = c.setIn(['b', 'c'], 10)
    expect(c1.getIn(['b', 'c'])).toBe(10)

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: { b: { c: 10 } } }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a', 'b', 'c'])
  })

  it('can get Record value as a property', () => {
    var User = Record({ name: 'John' })
    var users = List.of(new User())
    var data = Map({ users: users })
    var cursor = Cursor.from(data, ['users'])
    expect(cursor.first().name).toBe('John')
  })

  it('can set value of a cursor directly', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: 1 })
    var c = Cursor.from(data, ['a'], onChange)
    var c1 = c.set(2)
    expect(c1.deref()).toBe(2)

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: 2 }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a'])
  })

  it('can set value of a cursor to undefined directly', () => {
    var onChange = jest.fn()
    var data = fromJS({ a: 1 })
    var c = Cursor.from(data, ['a'], onChange)
    var c1 = c.set(undefined)
    expect(c1.deref()).toBe(undefined)

    var call = onChange.mock.calls[0]
    expect(call[0]).toValueEqual(fromJS({ a: undefined }))
    expect(call[1]).toBe(data)
    expect(call[2]).toEqual(['a'])
  })
})
