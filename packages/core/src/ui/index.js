'use strict'

'use strict'

import R from 'ramda'
import { Iterable } from 'immutable'
import React from 'react'

import invariant from 'invariant'

import { warning } from '../impl/log'
import { Registry, chainRegistries } from '../registry'
import ElementView from './ElementView'
import * as data from '../data'
import { memoize } from '../impl/util'
import { isSubclassOf } from '../impl/classes'

const registryAttribute = '@@girders-elements/_uiRegistry'

// required subsystems
import * as SubSystem from '../subsystem'

SubSystem.extend(() => {
  const registry = new Registry()

  return {
    ui: {
      [registryAttribute]: registry,

      register(kind, Component) {
        invariant(
          data.isElementRef(kind),
          'You must provide a valid element reference to register'
        )
        invariant(
          Component != null &&
            (isSubclassOf(Component, React.Component) ||
              typeof Component === 'function'),
          'You must provide a react component class or a pure-function component'
        )

        registry.register(kind, ElementView(kind, Component))
      },

      reset() {
        // do nothing as the o
        // registry.reset()
      },
    },
  }
})

export default SubSystem.create(system => {
  const runtime = {
    registry: getCombinedRegistry(system.subsystemSequence),

    system,

    uiFor(element, reactKey = undefined) {
      return system.subsystems.ui.uiFor(element, reactKey)
    },
  }

  const _forElement = forElement(runtime)
  const _forElements = forElements(_forElement)

  return {
    name: 'ui',

    uiFor(element, reactKey = undefined) {
      if (Iterable.isIndexed(element)) {
        const ui = _forElements(element)
        return ui
      }

      return _forElement(element, reactKey)
    },
  }
})

const forElement = runtime => {
  const { registry } = runtime

  const componentFor = memoize(kind => {
    const C = registry.get(kind)
    if (C != null) return C(runtime)
    warning(`Couldn't find the following kind(s) within the registry: [${kind.toJS()}]`)
    return null
  })

  return (element, reactKey = undefined) => {
    if (element == null) {
      return null
    }

    invariant(
      data.isElement(element),
      'You provided something other than an element for ui lookup'
    )

    invariant(
      element._keyPath != null,
      'The current implementation requires a Cursor to be passed in. This may be removed in the future'
    )

    const kind = data.kindOf(element)
    const Component = componentFor(kind)

    if (Component) {
      return <Component element={element} key={reactKey} />
    }
  }
}

const forElements = R.curry((elementBuilder, elementSeq) =>
  elementSeq.map(elementBuilder).filter(ui => !!ui)
)

const getRegistry = R.path(['ui', registryAttribute])

const getCombinedRegistry = R.pipe(
  R.map(getRegistry),
  R.reject(R.isNil),
  chainRegistries
)
