# Configuration


Configuration consists of one or more **features** (ex. translations, theme etc).
Configurations are distributed by **layers.** Each layer has its own **configuration object**.
Layers are organized in a hirearchy, with every layer overriding the configuration object of its parents.

The values in each configuration object are defined in **profiles.** Everything defined at root level belongs to a default (implicit) profile.
When a configuration is initialized, a list of profiles is provided.
The order of the profile definition is important, as they have priority (highest priority is listed first).
The default profile is always resolved last (i.e. has lowest priority)

##### Example configuration object:

```javascript

const theme = {
   backgoundColor: red,         // configuration value in the default profile
   profiles: {                  // profiles
     dev: {                     // dev
         backgoundColor: white  // dev config value
     },
     android: {                 // android
        backgoundColor: blue    // android config value
     }
   }
}

```


### Configuration API

#### Defining layers:
Calling the define method on configuration creates a root layer from a given configuraton object and returns the created layer.
Calling define on a given layer also creates and returns a new layer, and links the newly created layer as child of the original one.

```javascript
import config from '@girders-elements/config'

import videoRoot from './videoRoot'
import translationsRoot from './translationsRoot'

import video1 from './video1'
import translations1 from './translations1'

import video2 from './video2'
import translations2 from './translations2'

// root layer is defined
const rootLayer = config.define ({
    video: videoRoot,
    translations: translationsRoot
})

// layer1 is defined, with rootLayer is its parent
const layer1 = rootLayer.define ({
    video: video1,
    translations: translations1
})

// layer2 is defined, with layer1 is its parent
const layer2 = layer1.define ({
    video: video2,
    translations: translations2
})
```

#### Initializing layers
Calling the init method on a layer computes the configuration for the given layer sequence.
 The sequence consists of all parent layers to the one being initialized, up to and including the root layer.
 After initialization, the computed configuration values are available for all the members of the layer chain, as immutable values.
 Once a configuration is computed the layers are 'frozen', and they can neither be re-initialized nor modified.

```javascript
// intializing layer2 computes the configuration and makes it available to its layer sequence (rootLayer -> layer1 -> layer2)
layer2.init(profiles)

// the same computed configuration is available for all layers in the sequence
// layer2.video === layer1.video === rootLayer.video
// layer2.translations === layer1.translations === rootLayer.translations

// throws - layers are frozen and cannot be re-initialized
rootLayer.init()
layer1.init()
layer2.init()

// throws - computed configuration cannot be modified
layer1.video.playerID = newPlayerID
```

### Examples

#### Multiple layers, one feature, one profile


```javascript
  const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        profiles: {
          dev: {
            a: 5,
            b: 6
          }
        }
      }
    }
    const layerTwoConfig = {
      config1: {
        b: 3
      }
    }
    const layerThreeConfig = {
      config1: {
        profiles: {
          dev: {
            b: 10
          }
        }
      }
    }
    init('dev')
```

##### Config1 resolution:

###### Layer 3:

**dev** profile: { b: 10}

**default** profile: { }

**final**: { b: 10 }

###### Layer 2:

**dev** profile: {}

**default** profile: { b: 3 }

**final**: { b: 3 }

###### Layer 1:
**dev** profile: { a: 5, b: 6 }

**default** profile: { a: 1, b: 2 }

**final**: { a: 5, b: 6 }

###### Final:

**Layer 2**: { a: 16, b: 14 }

**Layer 1**: { a: 1, b: 7, c: 3 }

**Final**:  { a: 16, b: 14, c: 3 }

##### Multiple layers, features and profiles

* Features - config1 and config2
* Profiles - dev, prod, ios, android
* Layers - layer1 and layer2

```javascript

  const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        c: 3,
        profiles: {
          prod: {
            b: 6
          },
          ios: {
            b: 7
          },
          android: {
            a: 8
          }
        }
      }
    }

    const layerTwoConfig = {
      config1: {
        a: 10,
        b: 11,
        profiles: {
          dev: {
            b: 14
          },
          prod: {
            a: 15
          },
          ios: {
            a: 16
          },
          android: {
            b: 17
          }
        }
      },
      config2: {
        c: 5,
        profiles: {
          dev: {
            c: 10
          },
          prod: {
            c: 1
          },
          ios: {
            c: 2
          },
          android: {
            c: 3
          }
        }
      }
    }

    const expectedConfig1 = {
      a: 16,
      b: 14,
      c: 3
    }

    const expectedConfig2 = {
      c: 10
    }

    init(['dev', 'ios'])

```



##### Config1 resolution:

###### Layer 2:
**dev** profile: { b: 14 }

**ios** profile: { a: 16 }

**default** profile: { a: 10, b: 11 }

**final**: { a: 16, b: 14 }


###### Layer 1:

**dev** profile: {}

**ios** profile: { b: 7 }

**default** profile: { a: 1, b: 2, c: 3 }

**final**: { a: 1, b: 7, c: 3 }

###### Final:

**Layer 2**: { a: 16, b: 14 }

**Layer 1**: { a: 1, b: 7, c: 3 }

**Final**:  { a: 16, b: 14, c: 3 }


##### Config2 resolution:
##### Layer 2:
**dev** profile: { c: 10 }

**ios** profile: { c: 2 }

**default** profile: { c: 5 }

**final**: { c: 10 }


###### Layer 1:

**No config**

**final**: { }

###### Final:

**Layer 2**: { c: 10 }

**Layer 1**: { }

**Final**:  { c: 10 }




