import { pickBy } from 'ramda'
import deepMerge from './utils/merge'

export let activeConfiguration = {};

let layers = []

export function define(configuration) {
  layers.push(configuration)
}

export function init(profiles) {

  // reverse the order of the profiles, least important handled first
  // and overridden with values from the more important profiles
  if (profiles) profiles.reverse()

   layers.forEach(layer => {
     Object.entries(layer).forEach(
       ([key, configOfLayer]) => {
         // values from (default) profile
         const defaultProfileForLayer = pickBy((val, key) => key !== 'profiles', configOfLayer)
         activeConfiguration[key] = deepMerge(activeConfiguration[key], defaultProfileForLayer)
         // if there are specific profiles available fetch the values from them
         if (profiles) {
           profiles.forEach(profile => {
             if (configOfLayer['profiles']) {
               activeConfiguration[key] = deepMerge(activeConfiguration[key], configOfLayer['profiles'][profile])
             }
           })
         }
       }
     )
   })
}
