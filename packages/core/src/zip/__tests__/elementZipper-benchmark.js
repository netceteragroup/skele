/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'
import R from 'ramda'

import * as zip from '..'
import * as data from '../../data'

import mainNavData from './mainNavData.json'

describe('elementZipper benchmarks', () => {
  const mainNavigationState = I.fromJS(mainNavData)
  console.log('zip', zip)

  test('elementZipper', () => {
    const test = cmsIds => {
      if (typeof cmsIds === 'string') {
        cmsIds = I.List([cmsIds])
      }

      return R.pipe(
        zip.elementZipper({}),
        zip.postWalk(el => {
          if (
            data.isOfKind(['component', 'action-buttons'], el) &&
            cmsIds.includes(el.get('cmsId'))
          ) {
            return el.set('bookmarked', true)
          }
          return el
        }),
        zip.value
      )
    }

    const test2 = cmsIds => {
      if (typeof cmsIds === 'string') {
        cmsIds = I.List([cmsIds])
      }

      return postW(el => {
        if (
          el &&
          el.get &&
          el.get('kind') &&
          data.isOfKind(['component', 'action-buttons'], el) &&
          cmsIds.includes(el.get('cmsId'))
        ) {
          return el.set('bookmarked', true)
        }
        return el
      })
    }

    // test2('ld.1439195')(mainNavigationState)

    new Suite()
      .add('zippers', () => {
        // I.Map({ sdafsd: 'asdfasdf' })
        // I.Map({ sadfs: 'asdfsafasasdf' })
        // I.Map({ sdafssadfsadfd: 'asdfaasdfasdfasdfsdf' })
        test('ld.1439195')(mainNavigationState)
      })
      .add('postwalk on imm', () => {
        test2('ld.1439195')(mainNavigationState)
      })
      .on('cycle', function(event) {
        console.log(event.target.toString())
      })
      .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
      })
      .run()
  })
})

const postW = R.curry(function postwalk(f, struct) {
  return walk(postwalk.bind(undefined, f), f, struct)
})

function walk(inner, outer, struct) {
  if (I.Iterable.isIterable(struct) && struct.has('kind')) {
    return outer(struct.map(inner))
  } else {
    return outer(struct)
  }
}
