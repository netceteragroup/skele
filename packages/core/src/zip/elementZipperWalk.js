'use strict'

import I from 'immutable'
import R from 'ramda'
import * as zip from '../zip'

const _postwalk = (f, zipper) => {
  return _walk(_postwalk.bind(undefined, f), f, zipper)
}

function _walk(inner, outer, zipper) {
  if (zip.canGoDown(zipper)) {
    // const first = zip.down(zipper)
    // const firstM = zip.down()
    // // const rest = []
    // const restM = []
    // let current = first
    // let canGoRight = zip.canGoRight(current)
    // while (canGoRight) {
    //   current = current.right()
    //   // rest.push(current)
    //   restM.push(zip.right())
    //   canGoRight = zip.canGoRight(current)
    // }
    // // const children = [first, ...rest]

    // const motion = [firstM, ...restM]
    // const changedZipper = R.reduce(
    //   (acc, move) => inner(move(acc)),
    //   zipper,
    //   motion
    // )

    // R.pipe(...motion)

    // const changedChildren = children.map(inner)
    // const changedValue = zip.makeItem(
    //   zipper,
    //   zip.value(zipper),
    //   R.map(zip.value, changedChildren)
    // )
    // const changedZipper = zip.replace(changedValue, zipper)

    // function* siblings(first) {
    //   let current = first
    //   while (current.canGoRight()) {
    //     current = current.right()
    //     yield current
    //   }
    // }

    // const changedZipper = R.reduce(
    //   (current, sibling) => inner(zip.right(current)),
    //   inner(zip.down(zipper)),
    //   I.Seq(siblings(zipper.down()))
    // )

    let current = inner(zip.down(zipper))
    while (zip.canGoRight(current)) {
      current = inner(zip.right(current))
    }

    return zip.edit(outer, current.up())
  } else {
    return zip.edit(outer, zipper)
  }
}

export const postWalk = R.curry(_postwalk)

// const postwalking = (f, zipper) => {
//   return walking(postwalking.bind(undefined, f), f, zipper)
// }

// export const postWalk2 = R.curry(postwalking)

// function walking(inner, outer, zipper) {
//   debugger
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

// const newPostwalk = (f, zipper) => {
//   return newWalk(newPostwalk.bind(undefined, f), f, zipper)
// }

// export const postWalk = R.curry(newPostwalk)

// function newWalk(inner, outer, zipper) {
//   if (zipper.canGoDown()) {
//     const children = zip.getChildren(zipper)
//     const changedChildren = R.map(
//       R.pipe(
//         zip.elementZipper,
//         zipper => inner(zipper)
//       )
//     )(children)

//     const changedValue = zip.makeItem(
//       zipper,
//       zip.value(zipper),
//       R.map(zip.value, changedChildren)
//     )

//     zipper = zip.replace(changedValue, zipper)
//   }

//   return zipper.edit(outer)
// }

// function postWalk4(loc) {
//   if (zip.canGoDown(loc)) {
//     const changedChildren = data.flow(
//       zip.getChildren(loc),
//       R.map(
//         R.pipe(
//           elementZipper({}),
//           loc => postWalk(loc)
//         )
//       )
//     )

//     const changedValue = zip.makeItem(
//       loc,
//       zip.value(loc),
//       R.map(zip.value, changedChildren)
//     )

//     loc = zip.replace(changedValue, loc)
//   }

//   const elEnricher = data.flow(
//     loc,
//     zip.value,
//     data.kindOf,
//     elementEnricher
//   )

//   if (elEnricher != null) {
//     //const changedValue = await elEnricher(zip.value(loc), context)

//     loc = zip.replace(changedValue, loc)
//   }

//   return loc
// }
