'use strict'

import * as R from 'ramda'
import I from 'immutable'
import React from 'react'
import PropTypes from 'prop-types'

import * as data from '../data'

import { isSubtreeRerenderEnabled } from '../kernel'

// TODO
// - element view must be kind-independent (rather to be linked to a perticular path in the tree)
// - element view must register itself for the keypath with the kernel for updates

export default R.curry((kind, Component, runtime) => {
  const { uiFor: globalUIFor, system } = runtime

  // eslint-disable-next-line react/no-deprecated
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

    componentDidMount() {
      if (isSubtreeRerenderEnabled(system.config)) {
        const keyPath = this.props.element._keyPath
        this._subscription = system.subscribe(() => this.forceUpdate(), keyPath)
      }
    }

    componentDidUpdate(oldProps) {
      if (isSubtreeRerenderEnabled(system.confg)) {
        const newKeyPath = this.props.element._keyPath
        const oldKeyPath = oldProps.element._keyPath
        if (!R.equals(oldKeyPath, newKeyPath)) {
          if (this._subscription != null) this._subscription()

          this._subscription = system.subscribe(
            () => this.forceUpdate(),
            newKeyPath
          )
        }
      }
    }

    componentWillUnmount() {
      if (isSubtreeRerenderEnabled(system.config)) {
        if (this._subscription != null) {
          this._subscription()
          this._subscription = null
        }
      }
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
