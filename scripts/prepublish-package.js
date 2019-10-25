#!/usr/bin/env node
'use strict'

const path = require('path')
const copyFiles = require('./commands/copy-exported-files')
const preparePackageJson = require('./commands/prepare-package-json')
const makeIndexFiles = require('./commands/make-index-files')

const packagePath = process.argv[2] || process.cwd()
const distPath = path.join(packagePath, 'dist')

;(async () => {
  await copyFiles(packagePath, distPath)
  await preparePackageJson(packagePath, distPath)
  await makeIndexFiles(packagePath, distPath)
})()
