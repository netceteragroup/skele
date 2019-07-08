'use strict'

import Unit, { unitDesc, iterate, unitDescriptor } from '../unit'
import * as E from '../extensions'

const makeExt = s => E.ext(s, () => ({}))

describe('Unit', () => {
  test('Unit definition', () => {
    const s = Symbol('s')
    const ex1 = makeExt(s)
    const ex2 = makeExt(s)

    const u = Unit(ex1, ex2)
    expect(Array.isArray(u)).toBeTruthy()
    expect(u).toContain(ex1)
    expect(u).toContain(ex2)
    expect(u.length).toEqual(2)
    expect(unitDesc(u)).toEqual(null)

    const u2 = Unit('Sample unit', ex1, ex2)
    expect(u2).toContain(ex1)
    expect(u2).toContain(ex2)
    expect(u2.length).toEqual(2)
    expect(unitDesc(u2)).toEqual('Sample unit')
  })

  test('Iteration', () => {
    const s = Symbol('s')
    const ex1 = makeExt(s)
    const ex2 = makeExt(s)

    const u = Unit('Top', ex1, ex2, Unit('Inner', makeExt(s)))

    const exts = Array.from(iterate(u))
    expect(exts).toMatchObject([
      {
        [E.props.extOf]: s,
        [unitDescriptor]: ['Top'],
      },
      {
        [E.props.extOf]: s,
        [unitDescriptor]: ['Top'],
      },
      {
        [E.props.extOf]: s,
        [unitDescriptor]: ['Top', 'Inner'],
      },
    ])
  })
})
