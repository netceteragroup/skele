'use strict'

import { define } from '../config'

describe('config', () => {
  test('single layer, default profile', () => {
    const testConfiguration = {
      config1: {
        a: 1,
      },
    }
    const layer = define(testConfiguration)
    layer.init()
    expect(layer.config1).toEqual({
      a: 1,
    })
  })

  test('three layers, one feature, one profile', () => {
    const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        profiles: {
          dev: {
            a: 5,
            b: 6,
          },
        },
      },
    }
    const layerTwoConfig = {
      config1: {
        b: 3,
      },
    }
    const layerThreeConfig = {
      config1: {
        profiles: {
          dev: {
            b: 10,
          },
        },
      },
    }
    const expectedConfig = {
      a: 5,
      b: 10,
    }

    // define the layers
    const rootLayer = define(layerOneConfig)
    const layer1 = rootLayer.define(layerTwoConfig)
    const layer2 = layer1.define(layerThreeConfig)

    // initialize the final layer
    layer2.init(['dev'])

    // config should be the same for all layers
    expect(rootLayer.config1).toEqual(expectedConfig)
    expect(layer1.config1).toEqual(expectedConfig)
    expect(layer2.config1).toEqual(expectedConfig)
  })

  test('one layer, one feature, multiple profiles', () => {
    const config = {
      config1: {
        a: 1,
        b: 2,
        c: 15,
        profiles: {
          dev: {
            a: 5,
            b: 6,
          },
          prod: {
            b: 10,
          },
          android: {
            a: 6,
            b: 7,
          },
          ios: {
            b: 11,
          },
        },
      },
    }
    const expectedConfig = {
      a: 6,
      b: 10,
      c: 15,
    }
    const rootLayer = define(config)
    rootLayer.init(['prod', 'android'])
    expect(rootLayer.config1).toEqual(expectedConfig)
  })

  test('two layers, single feature, two profiles', () => {
    const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        c: 3,
        profiles: {
          prod: {
            b: 6,
          },
          ios: {
            b: 7,
          },
          android: {
            a: 8,
          },
        },
      },
    }

    const layerTwoConfig = {
      config1: {
        a: 10,
        b: 11,
        profiles: {
          dev: {
            b: 14,
          },
          prod: {
            a: 15,
          },
          ios: {
            a: 16,
          },
          android: {
            b: 17,
          },
        },
      },
    }

    const expectedConfig = {
      a: 16,
      b: 14,
      c: 3,
    }
    const rootLayer = define(layerOneConfig)
    const layer1 = rootLayer.define(layerTwoConfig)
    layer1.init(['dev', 'ios'])

    expect(rootLayer.config1).toEqual(expectedConfig)
    expect(layer1.config1).toEqual(expectedConfig)
  })

  test('two features', () => {
    const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        c: 3,
        profiles: {
          prod: {
            b: 6,
          },
          ios: {
            b: 7,
          },
          android: {
            a: 8,
          },
        },
      },
    }

    const layerTwoConfig = {
      config1: {
        a: 10,
        b: 11,
        profiles: {
          dev: {
            b: 14,
          },
          prod: {
            a: 15,
          },
          ios: {
            a: 16,
          },
          android: {
            b: 17,
          },
        },
      },
      config2: {
        c: 5,
        profiles: {
          dev: {
            c: 10,
          },
          prod: {
            c: 1,
          },
          ios: {
            c: 2,
          },
          android: {
            c: 3,
          },
        },
      },
    }

    const expectedConfig1 = {
      a: 16,
      b: 14,
      c: 3,
    }

    const expectedConfig2 = {
      c: 10,
    }

    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    layer2.init(['dev', 'ios'])

    expect(layer1.config1).toEqual(expectedConfig1)
    expect(layer2.config1).toEqual(expectedConfig1)

    expect(layer1.config2).toEqual(expectedConfig2)
    expect(layer2.config2).toEqual(expectedConfig2)
  })

  test('throw on multiple init', () => {
    const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        c: 3,
        profiles: {
          prod: {
            b: 6,
          },
          ios: {
            b: 7,
          },
          android: {
            a: 8,
          },
        },
      },
    }

    const layerTwoConfig = {
      config1: {
        a: 10,
        b: 11,
        profiles: {
          dev: {
            b: 14,
          },
          prod: {
            a: 15,
          },
          ios: {
            a: 16,
          },
          android: {
            b: 17,
          },
        },
      },
      config2: {
        c: 5,
        profiles: {
          dev: {
            c: 10,
          },
          prod: {
            c: 1,
          },
          ios: {
            c: 2,
          },
          android: {
            c: 3,
          },
        },
      },
    }

    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    layer2.init(['dev', 'ios'])

    // throw on second init of layer 2
    expect(() => {
      layer2.init()
    }).toThrow()

    // throw on second init of layer 1
    expect(() => {
      layer1.init()
    }).toThrow()
  })

  test('check if config is immutable', () => {
    const layerOneConfig = {
      config1: {
        a: 1,
        b: 2,
        c: 3,
        profiles: {
          prod: {
            b: 6,
          },
          ios: {
            b: 7,
          },
          android: {
            a: 8,
          },
        },
      },
    }

    const layerTwoConfig = {
      config1: {
        a: 10,
        b: 11,
        profiles: {
          dev: {
            b: 14,
          },
          prod: {
            a: 15,
          },
          ios: {
            a: 16,
          },
          android: {
            b: 17,
          },
        },
      },
      config2: {
        c: 5,
        profiles: {
          dev: {
            c: 10,
          },
          prod: {
            c: 1,
          },
          ios: {
            c: 2,
          },
          android: {
            c: 3,
          },
        },
      },
    }

    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    layer2.init(['dev', 'ios'])

    expect(() => {
      layer1.config1 = 'override value'
    }).toThrow()

    expect(() => {
      layer1.config1.c = 'override value'
    }).toThrow()
  })
})
