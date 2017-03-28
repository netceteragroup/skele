module.exports = {
  root: true,
  parser: 'babel-eslint',

  env: {
    node: true,
    es6: true,
    browser: true,
    jest: true
  },

  extends: [
    "eslint:recommended",
    "plugin:react/recommended"
  ],

  plugins: [
    'promise',
    'react',
    'react-native'
  ]
}
