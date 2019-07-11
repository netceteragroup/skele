'use strict'

import System, { query, querySpecs } from '../system'
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
    expect(querySpecs([slot], sys)).toMatchObject([
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
    expect(querySpecs(slot, sys)).toMatchObject({
      id: 4,
    })
    expect(querySpecs([slot, propEq('id', 1)], sys)).toHaveLength(1)
    expect(
      querySpecs(
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

    console.log(sys)
  })
})
