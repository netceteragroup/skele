'use strict'

import { curry } from 'ramda'
import I from 'immutable'
import React from 'react'
import PropTypes from 'prop-types'

import * as data from '../data'

export default curry((kind, Component, runtime) => {
  const { uiFor: globalUIFor, system } = runtime

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
      this._reset(props)
    }

    componentWillReceiveProps(nextProps) {
      this._reset(nextProps)
    }

    shouldComponentUpdate(nextProps) {
      const { element: current } = this.props
      const { element: next } = nextProps

      if (
        (current != null && next == null) ||
        (current == null && next != null)
      ) {
        return true
      }

      return !I.is(current, next)
    }

    _reset(props) {
      this._system = system.focusOn(props.element._keyPath)
      this._dispatch = this._system.dispatch.bind(this._system)
    }

    _uiFor = (path, reactKey = undefined) => {
      const { element } = this.props

      let sub
      if (Array.isArray(path)) {
        sub = element.getIn(path)
      } else {
        sub = element.get(path)
      }

      // console.log('sub el lookup', sub, globalUIFor(sub, reactKey))
      return globalUIFor(sub, reactKey)
    }

    render() {
      return (
        <Component
          element={this.props.element}
          dispatch={this._dispatch}
          uiFor={this._uiFor}
        />
      )
    }
  }
})
