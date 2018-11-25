'use strict'

import I from 'immutable'
import R from 'ramda'

import * as zip from '../'

const appStateDualPanel = {
  kind: 'app',
  url: 'https://someurl.com',
  left: {
    kind: 'panel',
    metadata: {
      title: 'Title left',
      description: 'Description',
    },
  },
  right: [
    {
      kind: 'panel',
      metadata: {
        title: 'Title right 1',
        description: 'Description',
      },
    },
    {
      kind: 'panel',
      metadata: {
        title: 'Title right 2',
        description: 'Description',
      },
    },
  ],
}

describe('elementZipperWalk', () => {
  test('postWalk', () => {
    const trans = R.pipe(
      zip.elementZipper({
        defaultChildPositions: ['content', 'children', 'left', 'right'],
      }),
      zip.postWalk(el => {
        if (el.get('kind') === 'panel') {
          return el.setIn(
            ['metadata', 'title'],
            el.getIn(['metadata', 'title']) + ' new'
          )
        } else if (el.get('kind') === 'app') {
          return el.set('bla', 'abl')
        }
        return el
      }),
      zip.value
    )

    const result = trans(I.fromJS(appStateDualPanel))
    console.log(JSON.stringify(result.toJS(), null, 2))
  })
})
