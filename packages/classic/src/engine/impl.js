'use strict'

import * as R from 'ramda'
import React from 'react'
import PropTypes from 'prop-types'

import * as Kernel from '../kernel'
import * as Subsystem from '../subsystem'
import { defaultSubsystems } from '../core'

import memoizeOne from '../impl/memoize-one'

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
    this._unsubscribe = this.props.kernel.subscribe(this._reRender.bind(this))
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.kernel !== prevProps.kernel ||
      !R.equals(this.props.keyPath, prevProps.keyPath)
    ) {
      if (this._unsubscribe) this._unsubscribe()
      this._unsubscribe = this.props.kernel.subscribe(this._reRender.bind(this))
    }
  }

  componentWillUnmount() {
    if (this._unsubscribe) this._unsubscribe()
  }

  _reRender() {
    this.forceUpdate()
  }

  render() {
    const kernel = this.props.kernel
    return kernel.subsystems.ui.uiFor(kernel.query(this.props.keyPath))
  }
}

const buildImpl = memoizeOne(kernel => {
  const entryPointMixins = getCombinedMixins(kernel.subsystemSequence)

  return R.isEmpty(entryPointMixins)
    ? EntryPointImpl
    : R.reduce((C, M) => M(C), EntryPointImpl, entryPointMixins)
})

export class EntryPoint extends React.Component {
  static propTypes = EntryPointImpl.propTypes

  constructor(props, context) {
    super(props, context)
  }

  render() {
    const Impl = buildImpl(this.props.kernel)
    return <Impl {...this.props} />
  }
}

const buildKernel = memoizeOne(
  (initState, subsystems, additionalSubsystems, customMiddleware, config) => {
    subsystems = subsystems || defaultSubsystems

    if (additionalSubsystems != null) {
      subsystems = subsystems.concat(additionalSubsystems)
    }

    if (customMiddleware != null) {
      subsystems = subsystems.concat(
        R.map(Subsystem.fromMiddleware, customMiddleware)
      )
    }
    return Kernel.create(subsystems, initState, config)
  }
)

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
  }

  render() {
    const {
      initState,
      customMiddleware,
      subsystems,
      additionalSubsystems,
      config,
    } = this.props
    const kernel = buildKernel(
      initState,
      subsystems,
      additionalSubsystems,
      customMiddleware,
      config
    )
    return <EntryPoint kernel={kernel} keyPath={[]} />
  }
}

const getCombinedMixins = R.chain(Subsystem.engineMixins)
