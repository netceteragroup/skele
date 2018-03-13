'use strict'

import invariant from 'invariant'

export default function System(def) {
  invariant(
    typeof def === 'object',
    'The system definition must be an object declaring the subsystems'
  )

  const subsystems = flow(
    def,
    objEntries,
    map(subsystemDef),
    map(instantiate),
    toObj
  )

  return {
    subsystems,
  }
}

// todo: use Object.entries; contributions() flexible wrt. subsystem / subsystem instance

const subsystemDef = ([name, def]) =>
  typeof def === 'function'
    ? { type: 'sub', def, name, deps: [] }
    : { type: 'sub', def: () => def, name, deps: [] }

const instantiate = def => {
  return {
    ...def,
    instance: def.def(),
  }
}

// Utilities

const objEntries = obj => {
  const ownProps = Object.keys(obj)
  let i = ownProps.length
  const resArray = new Array(i)
  while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]]

  return resArray
}

const toObj = defs => {
  let result = {}

  defs.forEach(({ name, instance }) => {
    result[name] = instance
  })

  return result
}

const flow = (value, ...fns) => {
  let v = value
  fns.forEach(f => {
    v = f(v)
  })
  return v
}

const map = f => col => col.map(f)
