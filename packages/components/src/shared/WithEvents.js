'use strict'

import PropTypes from 'prop-types'

const listeners = '@@skele.internal/listeners'
const lastEvent = '@@skele.internal/lastEvent'

/**
 * A mixin that adds event handling methods to a React component
 *
 * @param eventDefinitons an array of event definitions or a single event definition
 * @param OriginalComponent
 *
 * an event definition is either
 * - a string, representing the event name
 * - an object with the following properties:
 *   - name: the event name (required)
 *   - inChildContext: whether the event should be exposed in childContext
 *     defaults to false
 *   - notifiesWithLastEventOnAdd: whether the listeners are invoked when added
 *     defaults to false
 *   - addMethod: name of the add listener method (optional)
 *   - removeMethod: name of the remove listener method (optional)
 *   - notifyMethod: name of the notify listeners method (optional)
 */
export default (eventDefinitons, OriginalComponent) => {
  const defs = normalizeEventDefinitions(eventDefinitons)
  const inChildContext = defs.filter(d => d.inChildContext)

  class Derived extends OriginalComponent {
    constructor(props, context) {
      super(props, context)

      this[listeners] = {}

      defs.forEach(d => {
        this[listeners][d.name] = []
        this[d.addMethod] = this[d.addMethod].bind(this)
        this[d.removeMethod] = this[d.removeMethod].bind(this)
        this[d.notifyMethod] = this[d.notifyMethod].bind(this)
      })
    }

    getChildContext() {
      const orig = super.getChildContext && super.getChildContext()

      if (inChildContext.length > 0) {
        let derived = { ...orig }

        inChildContext.forEach(d => {
          derived[d.addMethod] = this[d.addMethod]
          derived[d.removeMethod] = this[d.removeMethod]
        })

        return derived
      }

      return orig
    }

    static displayName = `WithListeners(${OriginalComponent.displayName ||
      OriginalComponent.name ||
      'Component'})`

    static propTypes = OriginalComponent.propTypes
  }

  // Add event handling methods

  defs.forEach(function(d) {
    Derived.prototype[d.addMethod] = function(callback) {
      if (this[listeners][d.name].indexOf(callback === -1)) {
        this[listeners][d.name].push(callback)
        d.notifiesWithLastEventOnAdd &&
          this[lastEvent] &&
          callback(this[lastEvent])
      }
    }

    Derived.prototype[d.removeMethod] = function(callback) {
      const index = this[listeners][d.name].indexOf(callback)
      if (index !== -1) {
        this[listeners][d.name].splice(index, 1)
      }
    }

    Derived.prototype[d.notifyMethod] = function(evt) {
      this[listeners][d.name].forEach(callback => callback(evt))
      this[lastEvent] = evt
    }
  })

  // add Child contextTypes

  Derived.childContextTypes = {
    ...OriginalComponent.childContextTypes,
  }

  if (inChildContext.length > 0) {
    inChildContext.forEach(d => {
      Derived.childContextTypes[d.addMethod] = PropTypes.func
      Derived.childContextTypes[d.removeMethod] = PropTypes.func
    })
  }

  return Derived
}

function normalizeEventDefinitions(eventDefs) {
  let defs = eventDefs

  if (!Array.isArray(defs)) {
    defs = [defs]
  } else if (defs == null) {
    defs = []
  }

  defs = defs.map(d => (typeof d === 'string' ? { name: d } : d))
  defs.forEach(d => (d.name = capitalize(d.name)))

  defs = defs.map(d => ({
    inChildContext: false,
    notifiesWithLastEventOnAdd: false,
    addMethod: `add${d.name}Listener`,
    removeMethod: `remove${d.name}Listener`,
    notifyMethod: `notify${d.name}Listeners`,

    ...d,
  }))

  return defs
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1)
}
