'use strict'

import deepFreeze from '../utils/freeze'

describe('freeze utils', () => {
  test('should deep freeze object', () => {
    const obj = {
      field1: {
        sub1: 1,
        sub2: 2,
      },
      field2: {
        sub1: [1, 2],
      },
    }
    let frozenObj = deepFreeze(obj)

    expect(() => {
      frozenObj.field1 = { a: 1, b: 2 }
    }).toThrow()

    expect(() => {
      frozenObj.field1.sub1 = 5
    }).toThrow()
  })
})
