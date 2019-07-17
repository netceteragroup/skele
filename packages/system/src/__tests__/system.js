'use strict'

import System, { query, queryExts } from '../system'
import Unit from '../unit'
import * as E from '../extensions'
import * as U from '../util'

const mockExt = (slot, name, val) => {
  if (val == null) {
    val = name
    name = null
  }

  return U.flow(
    E.ext(slot, () => val),
    E.set('id', val),
    U.when(() => name != null, E.named(name))
  )
}

const mockExtDeps = (slot, deps, val) =>
  U.flow(
    E.ext(slot, deps => ({ val, deps })),
    E.using(deps),
    E.set('id', val)
  )

const propEq = (prop, v) => x => x[prop] === v

describe('System', () => {
  const slot = Symbol('s')
  const slot2 = Symbol('s2')
  const unused = Symbol('unused')
  const name = Symbol('name')

  const u1 = Unit(
    'U1',

    mockExt(slot, 1),
    mockExt(slot, 2),
    mockExt(slot2, name, 3)
  )

  const u2 = Unit(
    'U2',

    mockExt(slot, 4),
    mockExt(slot2, 5)
  )

  const sys = System('System', u1, u2)

  test('querySpecs', () => {
    expect(queryExts([slot], sys)).toMatchObject([
      {
        id: 1,
      },
      {
        id: 2,
      },
      {
        id: 4,
      },
    ])
    expect(queryExts(slot, sys)).toMatchObject({
      id: 4,
    })
    expect(queryExts([slot, propEq('id', 1)], sys)).toHaveLength(1)
    expect(
      queryExts(
        {
          [E.props.extOf]: slot,
          [E.props.one]: true,
          [E.props.qFilter]: propEq('id', 1),
        },
        sys
      )
    ).toMatchObject({
      id: 1,
    })

    expect(queryExts(unused, sys)).toBeUndefined()
    expect(queryExts([unused], sys)).toEqual([])
    expect(
      queryExts(
        {
          [E.props.extOf]: unused,
          [E.props.one]: true,
          [E.props.qFilter]: propEq('id', 1),
        },
        sys
      )
    ).toBeUndefined()

    expect(() => queryExts(slot)).toThrow()
    expect(() => queryExts()).toThrow()
    expect(() => queryExts('foo', sys)).toThrow()
    expect(() => queryExts(1, sys)).toThrow()
    expect(() => queryExts([1, 2], sys)).toThrow()
    expect(() => queryExts([], sys)).toThrow()
  })

  test('query', () => {
    expect(query(name, sys)).toEqual(3)
    expect(query([slot], sys)).toEqual([1, 2, 4])
    expect(query([slot, propEq('id', 1)], sys)).toEqual([1])
    expect(
      query(
        {
          [E.props.extOf]: slot,
          [E.props.one]: true,
          [E.props.qFilter]: propEq('id', 1),
        },
        sys
      )
    ).toEqual(1)
  })
})

describe('Extension Dependencies', () => {
  const slot = Symbol('s')
  const slot2 = Symbol('s2')
  const slot3 = Symbol('s3')
  const name = Symbol('name')

  const u1 = Unit(
    'U1',

    mockExt(slot, 1),
    mockExt(slot, 2),
    mockExt(slot2, 3),

    mockExtDeps(slot3, { d1: slot, n1: name }, 4)
  )

  const u2 = Unit(
    'U2',

    mockExt(slot, 5),
    mockExtDeps(slot, { n1: [name] }, 10)
  )

  const sys = System(
    'Sys',

    u1,
    u2,

    mockExt(slot, name, 6),
    mockExtDeps(slot3, { d1: [slot2], d2: [slot] }, 7)
  )

  test('deps', () => {
    expect(query([slot3], sys)).toMatchObject([
      {
        val: 4,
        deps: {
          d1: 6,
          n1: 6,
        },
      },
      {
        val: 7,
        deps: {
          d1: [3],
          d2: [
            1,
            2,
            5,
            {
              deps: {
                n1: [6],
              },
              val: 10,
            },
            6,
          ],
        },
      },
    ])
  })

  test('no circular deps', () => {
    const sys2 = System(
      'sys2',

      // circular
      mockExtDeps(slot3, { c3: slot2 }, 7),
      mockExtDeps(slot2, { c2: slot3 }, 11)
    )

    expect(() => query(slot2, sys2).deps.c2.deps.c3).toThrow()
  })

  test('query with topological order', () => {
    expect(query([slot, E.all, E.order.topological], sys)).toMatchObject([
      1,
      2,
      6, // 6 comes before 10 because it's a dependency of it
      5, // 5 is a dep of 4 (not in this slot) which has 6 as dep
      {
        val: 10,
        deps: {
          n1: [6],
        },
      },
    ])
  })
})
