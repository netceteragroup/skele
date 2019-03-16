'use strict'

import * as R from 'ramda'
import I from 'immutable'
import React from 'react'
import PropTypes from 'prop-types'

import { data } from '@skele/core'

import memoizeOne from '../impl/memoize-one'
import { actionMetaProperty, actionMeta } from '../action'

export default R.curry((kind, Component, runtime) => {
  const { uiFor: globalUIFor, system } = runtime

  const interactive = action => {
    const meta = actionMeta(action)
    return {
      ...action,
      [actionMetaProperty]: {
        ...meta,
        interactive:
          meta && meta.hasOwnProperty('interative') ? meta.interative : true,
      },
    }
  }

  const dispatchFor = memoizeOne(element => {
    const focused = system.focusOn(element._keyPath)
    const dispatch = focused.dispatch.bind(focused)

    return action => dispatch(interactive(action))
  })

  return class extends React.Component {
    static propTypes = {
      element: PropTypes.object.isRequired,
    }

    static contextTypes = {
      store: PropTypes.object,
    }

    static displayName = `ElementView[${data.canonical(kind).toJS()}]`

    constructor(props) {
      super(props)
    }

    shouldComponentUpdate(nextProps) {
      let { element: current } = this.props
      let { element: next } = nextProps

      if (
        (current != null && next == null) ||
        (current == null && next != null)
      ) {
        return true
      }

      if (current.deref) current = current.deref()
      if (next.deref) next = next.deref()

      return !I.is(current, next)
    }

    _uiFor = (path, reactKey = undefined) => {
      const { element } = this.props

      let sub
      if (Array.isArray(path)) {
        sub = element.getIn(path)
      } else {
        sub = element.get(path)
      }

      return globalUIFor(sub, reactKey)
    }

    render() {
      const dispatch = dispatchFor(this.props.element)
      return (
        <Component
          element={this.props.element}
          dispatch={dispatch}
          uiFor={this._uiFor}
        />
      )
    }
  }
})
