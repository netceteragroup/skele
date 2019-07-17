'use strict'

import { runtime, slots, start, stop } from '../runtime'
import System, * as S from '../system'
import { props, ext, using } from '../extensions'

describe('runtime', () => {
  test('runtime DSL', () => {
    const f = () => ({})
    const name = Symbol('name')
    const n1 = Symbol('n1')

    expect(() => runtime(f)).toThrow()
    expect(() => runtime({ dep1: n1 }, f)).toThrow()
    expect(() => runtime('fooo', f)).toThrow()

    expect(runtime(name, f)).toEqual({
      [props.extFactory]: f,
      [props.extOf]: [slots.runtime, name],
    })

    expect(runtime(name, { dep1: n1 }, f)).toMatchObject({
      [props.extOf]: [slots.runtime, name],
      [props.extFactory]: f,
      [props.deps]: {
        dep1: {
          [props.extOf]: n1,
          [props.one]: true,
        },
      },
    })
  })

  test('start & stopping', () => {
    const context = Symbol('context')
    const name0 = Symbol('name0')
    const name1 = Symbol('name1')
    const name2 = Symbol('name2')
    const name3 = Symbol('name3')
    const name4 = Symbol('name4')

    const r0 = runtime(
      name0,
      { motor: name1, context: [context] },
      ({ motor, context }) => ({
        motor,
        context,
        start: jest.fn(),
        stop: jest.fn(),
      })
    )

    const r1 = runtime(name1, () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }))

    const r2 = runtime(name2, () => ({
      start: jest.fn(),
    }))

    const r3 = runtime(name3, () => ({
      start: jest.fn(),
      stop: jest.fn(),
      dispatch: jest.fn(),
    }))

    const r4 = runtime(name4, () => ({}))

    const dispatcher = using(
      { store: name3 },
      ext(context, ({ store }) => ({
        dispatch: x => store.dispatch(x),
      }))
    )

    const sys = System(
      'sys',

      r0,
      r1,
      r2,
      r3,
      dispatcher,
      r4
    )

    start(sys)

    const rs = S.query([slots.runtime], sys)

    expect(rs[0].start).toHaveBeenCalled()
    expect(rs[1].start).toHaveBeenCalled()
    expect(rs[2].start).toHaveBeenCalled()

    expect(rs[1].start).toHaveBeenCalledBefore(rs[0].start)
    expect(rs[3].start).toHaveBeenCalledBefore(rs[0].start)

    stop(sys)

    expect(rs[0].stop).toHaveBeenCalled()
    expect(rs[1].stop).toHaveBeenCalled()

    expect(rs[0].stop).toHaveBeenCalledBefore(rs[1].stop)
    expect(rs[0].stop).toHaveBeenCalledBefore(rs[3].stop)
  })
})
