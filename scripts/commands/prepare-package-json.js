#!/usr/bin/env node
'use strict'

const join = require('path').join
const mkdirp = require('mkdirp-promise')
const xform = require('../util/xform-json')

module.exports = async (packagePath, distPath) => {
  await mkdirp(distPath)
  xform(join(packagePath, 'package.json'), join(distPath, 'package.json'), {
    remove: ['type'],
    main: 'index',
    module: 'index.mjs',
    'react-native': 'index.js',
    files: fs => fs.concat(['index.mjs', 'cjs/', 'mjs/']),
  })
}
