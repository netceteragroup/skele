/**
 * @jest-environment node
 */

import Registry from '../Registry'
import MultiValueRegistry from '../MultivalueRegistry'
import Trie from '../impl/Trie'

import Benchmark from 'benchmark'
const Suite = Benchmark.Suite

describe('benchmarks on registry access', () => {
  const keySet = [
    ['edition', 'management', 'delete'],
    ['scene', 'settings'],
    ['scene', 'settings', 'container'],
    ['scene', 'settings', 'item'],
    ['scene', 'settings', 'item', 'user'],
    ['scene', 'settings', 'link'],
    ['scene', 'settings', 'link', 'user'],
    ['scene', 'settings', 'slider'],
    ['scene', 'login'],
    ['__error', 'document', 'article'],
    ['__error', 'edition', 'departments-view'],
    ['__error', 'edition', 'page-list'],
    ['component', 'article'],
    ['document', 'article'],
    ['document', 'article', 'tablet'],
    ['document', 'edition'],
    ['document', 'stream-view'],
    ['edition', 'departments-view'],
    ['edition', 'menu'],
    ['edition', 'page-list'],
    ['edition', 'view-selector'],
    ['__error', 'component', 'editions'],
    ['__error', 'component', 'editions', 'phone'],
    ['__error', 'component', 'not-subscribed-item-image'],
    ['__error', 'document', 'storefront'],
    ['__error', 'document', 'storefront-not-subscribed'],
    ['__loading', 'component', 'not-subscribed-item-image'],
    ['__read', 'component', 'editions'],
    ['component', 'editions'],
    ['component', 'editions', 'header'],
    ['component', 'editions', 'inlay'],
    ['component', 'editions', 'inlay', 'item'],
    ['component', 'editions', 'item'],
    ['component', 'editions', 'item', 'phone'],
    ['component', 'editions', 'phone'],
    ['component', 'not-subscribed-item'],
    ['component', 'not-subscribed-item-image'],
    ['component', 'publications'],
    ['component', 'publications', 'item'],
    ['document', 'storefront'],
    ['document', 'storefront-not-subscribed'],
    ['app'],
    ['menu-item', 'menu-group'],
    ['menu-item', 'service-item'],
    ['navigation', 'right-menu'],
    ['navigation', 'side-menu'],
    ['scene'],
    ['__error'],
    ['__loading'],
    ['__read'],
  ]

  const len = keySet.length

  const randomKey = () => {
    const idx = Math.floor(Math.random() * len)
    return keySet[idx]
  }

  test('Benchmark: get ', () => {
    const registry = new Registry()
    const trie = new Trie()

    keySet.forEach(key => {
      registry.register(key, 'value')
      trie.register(key, 'value')
    })

    let key
    new Suite()
      .add('registry.get', () => {
        registry.get(key)
      })
      .add('trie.get', () => {
        trie.get(key)
      })
      .on('start cycle', function() {
        key = randomKey()
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
      })
      .run()

    // Outputs (on my machine):
    // registry.get x 249,113 ops/sec ±2.29% (83 runs sampled)
    // trie.get x 4,014,265 ops/sec ±0.70% (95 runs sampled)
    // Fastest is trie.get
  })

  test('Benchmark: collect vs. MultiValueRegistry ', () => {
    const registry = new MultiValueRegistry()
    const trie = new Trie()

    keySet.forEach(key => {
      const bagLen = Math.floor(Math.random() * 20)
      const bag = new Array(bagLen)
      bag.fill('value', 0, bagLen)

      bag.forEach(v => {
        registry.register(key, v)
      })

      trie.register(key, bag)
    })

    let key
    new Suite()
      .add('registry.get', () => {
        registry.get(key)
      })
      .add('trie.collect', () => {
        trie.collect(key)
      })
      .on('start cycle', function() {
        key = randomKey()
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
      })
      .run()

    // registry.get x 112,383 ops/sec ±0.82% (90 runs sampled)
    // trie.collect x 4,146,293 ops/sec ±0.59% (93 runs sampled)
    // Fastest is trie.collect
  })
})
