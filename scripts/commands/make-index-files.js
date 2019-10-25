'use strict'

const cpy = require('cpy')
const mkdirp = require('mkdirp-promise')
const join = require('path').join

const indexTemplates = join(__dirname, './index-files')

module.exports = async (packagePath, distPath) => {
  await mkdirp(distPath)

  await cpy(['index.*'], distPath, { cwd: indexTemplates })
}
