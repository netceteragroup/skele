'use strict';

import { define, init, activeConfiguration, reset } from '../config';

describe('config', () => {
  test('single layer, default profile', () => {
    const testConfiguration = {
      config1: {
        a: 1
      }
    }
    define(testConfiguration)
    init()
    expect(activeConfiguration).toEqual(testConfiguration);
  });

  test('multiple layers, single profile', () => {
    reset()
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
    const expectedConfig = {
      config1: {
        a: 5,
        b: 10
      }
    }
    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    const layer3 = layer2.define(layerThreeConfig)
    init(['dev'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });

  test('one layer, multiple profiles', () => {
    reset()
    const config = {
      config1: {
        a: 1,
        b: 2,
        c: 15,
        profiles: {
          dev: {
            a: 5,
            b: 6
          },
          prod: {
            b: 10
          },
          android: {
            a: 6,
            b: 7
          },
          ios: {
            b: 11
          }
        }
      }
    }
    const expectedConfig = {
      config1: {
        a: 6,
        b: 10,
        c: 15
      }
    }
    define(config)
    init(['prod', 'android'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });

  xtest('multiple layers, multiple profiles', () => {
    reset()
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
      }
    }

    const expectedConfig = {
      config1: {
        a: 16,
        b: 14,
        c: 3
      }
    }
    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    init(['dev', 'ios'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });

  test('multiple configurations', () => {
    reset()
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

    const expectedConfig = {
      config1: {
        a: 16,
        b: 14,
        c: 3
      },
      config2: {
        c: 10
      }
    }

    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    init(['dev', 'ios'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });

  test('throw on multiple init', () => {
    reset()
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

    const expectedConfig = {
      config1: {
        a: 16,
        b: 14,
        c: 3
      },
      config2: {
        c: 10
      }
    }

    const layer1 = define(layerOneConfig)
    const layer2 = layer1.define(layerTwoConfig)
    init(['dev', 'ios'])
    expect(() => {
      init()
    }).toThrow();
  });

});
