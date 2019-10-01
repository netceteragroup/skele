module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: false,
        debug: true,

        targets: {
          // basically, these are the first versions of the browsers that
          // shpped with ES2015 support (see
          // https://www.w3schools.com/js/js_versions.asp)
          // due to Safari 10 issues, const and let are compiled into var

          node: '10',
          chrome: '51',
          firefox: '54',
          safari: '10',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow', // TODO remove flow from project
  ],

  plugins: ['@babel/plugin-proposal-class-properties'],

  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          { targets: { node: 'current' }, useBuiltIns: false },
        ],
      ],
    },
    dev: {
      presets: [
        [
          '@babel/preset-env',
          { targets: { node: 'current' }, useBuiltIns: false },
        ],
      ],
    },
    legacy: {
      presets: [
        [
          '@babel/preset-env',
          // in legacy mode we compile towards current browserlist defaults
          // we don't include any polyfills and ask the user to specifically
          // to add Set, Symbol and regenerator-runtime in their target bundle
          { targets: 'defaults', useBuiltIns: false },
        ],
      ],
    },
  },
}
