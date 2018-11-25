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
    // given
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
        }
        return el
      }),
      zip.value
    )

    // when
    const result = trans(I.fromJS(appStateDualPanel))

    // then
    expect(result.getIn(['left', 'metadata', 'title'])).toBe('Title left new')
    expect(result.getIn(['right', 0, 'metadata', 'title'])).toBe(
      'Title right 1 new'
    )
    expect(result.getIn(['right', 1, 'metadata', 'title'])).toBe(
      'Title right 2 new'
    )
  })
})
