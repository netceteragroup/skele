import { pickBy } from 'ramda'
import deepMerge from './utils/merge'

export let activeConfiguration = {};

let layers = []

export function define(configuration) {
  layers.push(configuration)
}

export function init(profiles) {

  if (profiles) profiles.reverse()

   layers.forEach(layer => {
     // values from (default) profile
     const defaultProfileForLayer = pickBy((val, key) => key !== 'profiles', layer)
     activeConfiguration = deepMerge(activeConfiguration, defaultProfileForLayer)
     if(profiles) {
       profiles.forEach(profile => {
         if (layer['profiles']) {
           activeConfiguration = deepMerge(activeConfiguration, layer['profiles'][profile])
         }
       })
     }
   })
}
