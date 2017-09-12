'use strict'

import R from 'ramda'
import I from 'immutable'
import React from 'react'
import PropTypes from 'prop-types'

import * as Kernel from '../kernel'
import * as Subsystem from '../subsystem'
import { defaultSubsystems } from '../core'

class EntryPointImpl extends React.Component {
  static propTypes = {
    kernel: PropTypes.shape({
      subscribe: PropTypes.function,
      query: PropTypes.fuction,
      dispatch: PropTypes.function,
    }).isRequired,

    keyPath: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      ),
      PropTypes.string,
    ]),
  }

  static defaultProps = {
    keyPath: [],
  }

  constructor(props, context) {
    super(props, context)
    this._reset(props)
  }

  componentWillReceiveProps(nextProps) {
    this._reset(nextProps)
  }

  componentWillUnmount() {
    if (this._unsubscribe) this._unsubscribe()
  }

  _reset(props) {
    const { kernel, keyPath } = props

    if (this._unsubscribe) this._unsubscribe()

    this._unsubscribe = kernel.subscribe(this._reRender.bind(this))
    this._rootPath = keyPath
  }

  _reRender() {
    this.forceUpdate()
  }

  render() {
    const kernel = this.props.kernel
    return kernel.subsystems.ui.uiFor(kernel.query(this._rootPath))
  }
}

export class EntryPoint extends React.Component {
  static propTypes = EntryPointImpl.propTypes

  constructor(props, context) {
    super(props, context)
    this._reset(props)
  }

  componentWillReceiveProps(nextProps) {
    this._reset(nextProps)
  }

  _reset(props) {
    const { kernel } = props
    const entryPointMixins = getCombinedMixins(kernel.subsystemSequence)

    this.Impl = R.isEmpty(entryPointMixins)
      ? EntryPointImpl
      : R.reduce((C, M) => M(C), EntryPointImpl, entryPointMixins)
  }

  render() {
    return <this.Impl {...this.props} />
  }
}

export class Engine extends React.Component {
  static propType = {
    initState: PropTypes.object.isRequired,
    customMiddleware: PropTypes.arrayOf(PropTypes.func),
    subsystems: PropTypes.arrayOf(PropTypes.object),
    additionalSubsystems: PropTypes.arrayOf(PropTypes.object),
    config: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context)
    this._reset(props)
  }

  componentWillReceiveProps(nextProps) {
    const current = fromJS(this.props.initState)
    const next = fromJS(nextProps.initState)

    if (!I.is(current, next)) this._reset(nextProps)
  }

  _reset(props) {
    let subsystems = props.subsystems || defaultSubsystems
    if (props.additionalSubsystems != null) {
      subsystems = subsystems.concat(props.additionalSubsystems)
    }
    if (props.customMiddleware != null) {
      subsystems = subsystems.concat(
        R.map(Subsystem.fromMiddleware, props.customMiddleware)
      )
    }

    this._kernel = Kernel.create(subsystems, props.initState, props.config)
  }

  render() {
    return <EntryPoint kernel={this._kernel} keyPath={[]} />
  }
}

const getCombinedMixins = R.chain(Subsystem.engineMixins)
