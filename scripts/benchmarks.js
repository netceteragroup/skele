'use strict'

require('babel-register')
require('babel-polyfill')

const R = require('ramda')
const Benchmark = require('benchmark')
const Table = require('cli-table')
const yargs = require('yargs').argv

function benchmarkFile(f) {
  const cwd = process.cwd()

  return new Promise(resolve => {
    const test = require(cwd + '/' + f)
    const table = getTable(test.name)
    const suite = Benchmark.Suite(test.name, {
      onComplete: () => resolve(console.log(table.toString())),
    })

    const toTable = vo =>
      table.push([
        vo.target.name,
        prettyHz(vo.target.hz),
        prettyMoe(vo.target.stats.rme),
      ])

    const testNames = R.keys(test.tests)
    const tests = R.map(
      n => [n, test.tests[n], { onComplete: toTable }],
      testNames
    )

    tests.forEach(test => suite.add(...test))
    suite.run()
  })
}

function getTable(name) {
  return new Table({
    head: [name, 'Hertz', 'Margin of Error'],
    colWidths: [24, 24, 24],
  })
}

function prettyHz(hz) {
  return Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0))
}

function prettyMoe(moe) {
  return moe.toFixed(2) + '%'
}

// main

Promise.all(yargs._.map(benchmarkFile)).catch(console.trace)
