'use strict'

import { runtime, slots } from '../runtime'
import { props } from '../extensions'

describe('runtime', () => {
  test('runtime', () => {
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
})
