module.exports = {
  root: true,
  parser: 'babel-eslint',

  env: {
    node: true,
    es6: true,
    browser: true,
    jest: true,
  },

  extends: [
    'plugin:flowtype/recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],

  rules: {
    'react/display-name': 'warn',
  },

  plugins: ['promise', 'flowtype', 'react', 'prettier'],

  globals: {
    document: false,
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true,
      experimentalDecorators: true,
    },
  },

  rules: {
    'no-unused-vars': [1, { args: 'after-used' }],
    'no-duplicate-imports': 0,
    'import/no-duplicates': 2,
    'import/named': 0,
    'import/no-unresolved': 0,
    'react/prop-types': [1, { skipUndeclared: true }],
    'react/display-name': 0,
    'prettier/prettier': [
      'error',
      {
        tabWidth: 2,
        semi: false,
        printWidth: 80,
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],
  },
}
