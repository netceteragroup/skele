/**
 * @jest-environment node
 */

import { Suite } from 'benchmark'
import I from 'immutable'
import R from 'ramda'

import * as zip from '..'
import * as data from '../../data'

import mainNavData from './mainNavData.json'

const organization = {
  kind: 'pm',
  name: 'alex',
  children: [
    {
      kind: 'tc',
      name: 'zdravko',
      children: [
        {
          kind: 'tm',
          name: 'emilija',
        },
        {
          kind: 'tm',
          name: 'filip',
        },
      ],
    },
    {
      kind: 'tc',
      name: 'andon',
      children: {
        kind: 'tm',
        name: 'goran',
      },
    },
    {
      kind: 'tc',
      name: 'ognen',
    },
  ],
}

describe('elementZipper benchmarks', () => {
  const mainNavigationState = I.fromJS(mainNavData)

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

    const test3 = cmsIds => {
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

    new Suite()
      .add('zippers', () => {
        test('ld.1439195')(mainNavigationState)
      })
      .add('postwalk on imm', () => {
        test2('ld.1439195')(mainNavigationState)
      })
      .add('new postwalk with zippers', () => {
        test3('ld.1439195')(mainNavigationState)
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

const postwalk = (f, struct) => {
  return walk(postwalk.bind(undefined, f), f, struct)
}

const postW = R.curry(postwalk)

function walk(inner, outer, struct) {
  if (I.Iterable.isIterable(struct)) {
    return outer(struct.map(inner))
  } else {
    return outer(struct)
  }
}

// const postwalking = (f, zipper) => {
//   return walking(postwalking.bind(undefined, f), f, zipper)
// }

// const postwalkingCurried = R.curry(postwalking)

// function walking(inner, outer, zipper) {
//   if (zipper.canGoDown()) {
//     if (
//       zipper
//         .down()
//         .value()
//         .get('kind') === '@@skele/child-collection' &&
//       zipper.down().down() !== null
//     ) {
//       const childZipper = inner(zipper.down().down())
//       if (!childZipper) return zipper.down().down()
//       if (zipper.canGoRight()) {
//         return inner(
//           childZipper
//             .up()
//             .up()
//             .edit(outer)
//             .right()
//         )
//       } else {
//         return childZipper
//           .up()
//           .up()
//           .edit(outer)
//       }
//     }
//   } else if (zipper.canGoRight()) {
//     return inner(zipper.edit(outer).right())
//   } else {
//     return zipper.edit(outer)
//   }
//   return zipper
// }
