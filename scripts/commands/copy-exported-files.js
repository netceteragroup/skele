'use strict'

/*
 * Copies all the files referred to in the `files` property inside
 * package.json, except package.json itself
 */
const path = require('path')
const cpy = require('cpy')
const mkdirp = require('mkdirp-promise')

module.exports = async (packagePath, distPath) => {
  const pkg = require(path.join(packagePath, 'package.json'))
  const files = [...(pkg.files || ['*']), '!package.json', '!dist/']

  await mkdirp(distPath)
  await cpy(files, distPath, { cwd: packagePath })
}
