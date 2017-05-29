import { pickBy, reverse } from 'ramda'
import deepMerge from './utils/merge'

let layers = []

let activeConfiguration = {};

function define(configuration) {
  layers.push(configuration)
}

function init(profiles) {
  let activeProfiles = profiles

  // reverse the order of the profiles, least important handled first
  // and overridden with values from the more important profiles
  if (profiles){
    activeProfiles = reverse(profiles)
  }

  layers.forEach(layer => {
    Object.entries(layer).forEach(
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
  })
}

export {
  activeConfiguration,
  define,
  init
}

export default {
  activeConfiguration,
  define,
  init
}