'use strict'

import { fromJS } from 'immutable'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'

import transformSS from '..'

const app = Subsystem.create(() => ({
  name: 'app',
}))

describe('Context passed to transformers', () => {
  const data = {
    kind: 'root',
    value: 'test',
  }

  const transf = jest.fn()
  transf.mockImplementation(e => e)

  app.transform.register('root', transf)

  const kernel = Kernel.create([transformSS, app], data, {})

  test('the context object passed to the transformer is available to transformer fns', () => {
    const transformer = kernel.subsystems.transform.buildTransformer()
    const context = { uri: 'urn:example' }

    transformer(fromJS(data), context)

    expect(transf).toHaveBeenCalled()
    expect(transf.mock.calls[0][1]).toEqual(context)
  })
})
