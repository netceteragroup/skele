'use strict';

import { define, init, activeConfiguration } from '../config';

describe('config', () => {
  test('single layer, default profile', () => {
    const testConfiguration = {a: 1}
    define(testConfiguration)
    init()
    expect(activeConfiguration).toEqual(testConfiguration);
  });

  test('multiple layers, single profile', () => {
    const layerOneConfig = {
      a: 1,
      b: 2,
      profiles: {
        dev: {
          a: 5,
          b: 6
        }
      }
    }
    const layerTwoConfig = {
      b: 3
    }
    const layerThreeConfig = {
      profiles: {
        dev: {
          b: 10
        }
      }
    }
    const expectedConfig = {
      a: 5,
      b: 10
    }
    define(layerOneConfig)
    define(layerTwoConfig)
    define(layerThreeConfig)
    init(['dev'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });

  test('one layer, multiple profiles', () => {
    const config = {
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
    const expectedConfig = {
      a: 6,
      b: 10,
      c: 15
    }
    define(config)
    init(['prod', 'android'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });

  test('multiple layers, multiple profiles', () => {
    const layerOneConfig = {
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

    const layerTwoConfig = {
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
    const expectedConfig = {
      a: 16,
      b: 14,
      c: 3
    }
    define(layerOneConfig)
    define(layerTwoConfig)
    init(['dev', 'ios'])
    expect(activeConfiguration).toEqual(expectedConfig);
  });
});
