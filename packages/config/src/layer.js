import { pickBy, reverse } from 'ramda'
import deepMerge from './utils/merge'
import deepFreeze from './utils/freeze'

export default class Layer {
  configuration
  prev
  frozen

  constructor(configuration, prev, frozen) {
    this.configuration = configuration
    this.prev = prev
    this.frozen = frozen
  }

  define(config) {
    return new Layer(config, this, false)
  }

  init(profiles) {

    // reverse the order of the profiles, least important handled first
    // and overridden with values from the more important profiles
    let activeProfiles = profiles
    if (profiles){
      activeProfiles = reverse(profiles)
    }

    // create a sequence of layers, starting from the current one, up to the root, in reverse order (root comes first)
    let sequenceOfLayers = []
    let layer = this
    while (layer) {
      sequenceOfLayers.unshift(layer)
      layer = layer.prev
    }

    // compute the configurations
    let computedConfigurations = []
    sequenceOfLayers.forEach (layer => {
      if (layer.frozen) {
        throw 'Cannot initialize configuration, layer is frozen'
      }
      // iterate through features
      Object.entries(layer.configuration).forEach(
        ([feature, configOfLayer]) => {

          // values from (default) profile
          const defaultProfileForLayer = pickBy((val, key) => key !== 'profiles', configOfLayer)
          computedConfigurations[feature] = deepMerge(computedConfigurations[feature], defaultProfileForLayer)

          // if there are specific profiles available fetch the values from them
          if (activeProfiles) {
            activeProfiles.forEach(profile => {
              if (configOfLayer['profiles']) {
                computedConfigurations[feature] = deepMerge(computedConfigurations[feature], configOfLayer['profiles'][profile])
              }
            })
          }
        }
      )
      layer.frozen = true
    })

    // add the computed configurations to all layers in the sequence
    sequenceOfLayers.forEach (layer => {
      // iterate through features
      Object.entries(computedConfigurations).forEach(
        ([feature, computedConfiguration]) => {

          Object.defineProperty(layer, feature, {
            writable: false,
            value: deepFreeze(computedConfiguration)
          });
        }
      )
    })

  }

}