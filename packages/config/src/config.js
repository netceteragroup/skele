import { pickBy, reverse } from 'ramda'
import deepMerge from './utils/merge'

import RootLayer from './root'
import Layer from './layer'

let rootLayer

let activeConfiguration = {};

function reset() {
  rootLayer = null
  activeConfiguration = {}
}

function define(configuration) {
  if (!rootLayer) {
    rootLayer = new RootLayer(configuration)
  } else {
    rootLayer.define(configuration)
  }
  return rootLayer
}

function init(profiles) {
  let activeProfiles = profiles

  // reverse the order of the profiles, least important handled first
  // and overridden with values from the more important profiles
  if (profiles){
    activeProfiles = reverse(profiles)
  }

  let layer = rootLayer.root

  while(layer) {
    if (layer.frozen) {
      throw 'Cannot initialize configuration, layer is frozen'
    }
    Object.entries(layer.configuration).forEach(
      ([key, configOfLayer]) => {
        // values from (default) profile
        const defaultProfileForLayer = pickBy((val, key) => key !== 'profiles', configOfLayer)
        activeConfiguration[key] = deepMerge(activeConfiguration[key], defaultProfileForLayer)
        // if there are specific profiles available fetch the values from them
        if (activeProfiles) {
          activeProfiles.forEach(profile => {
            if (configOfLayer['profiles']) {
              activeConfiguration[key] = deepMerge(activeConfiguration[key], configOfLayer['profiles'][profile])
            }
          })
        }
      }
    )
    layer.frozen = true
    layer = layer.next
  }
}

export {
  activeConfiguration,
  define,
  init,
  reset
}

export default {
  activeConfiguration,
  define,
  init,
  reset
}