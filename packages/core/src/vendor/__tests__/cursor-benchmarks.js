/**
 * @jest-environment node
 */

import Benchmark from 'benchmark'
const Suite = Benchmark.Suite

import OldCursor from 'immutable/contrib/cursor'
import Cursor from '../cursor'
import { fromJS } from 'immutable'

describe('Cursor benchmarks', () => {
  const data = {
    kind: ['navigation', 'main'],
    '@@skele/children': ['content'],
    content: {
      kind: ['navigation', 'tabbed'],
      '@@skele/children': 'tabs',
      tabs: [
        {
          kind: ['navigation', 'stack'],
          '@@skele/children': 'scenes',
          tabTitle: 'Title',
          scenes: [
            {
              sceneId: 'startseite',
              '@@skele/children': 'content',
              title: 'Scene Title',
              statusBarHideWithNavBar: true,
              content: {
                kind: ['document', 'x'],
                user: 'placeholder',
                '@@skele/children': ['publications'],
                publications: {
                  kind: ['component', 'publications'],
                  '@@skele/children': ['items', 'editions'],
                  items: [
                    {
                      kind: ['component', 'publications', 'item'],
                      publication: {
                        id: 483,
                        highlighted: false,
                        name: 'Publication 483',
                        publicationInterval: 'daily',
                      },
                    },
                    {
                      kind: ['component', 'publications', 'item'],
                      publication: {
                        id: 485,
                        highlighted: false,
                        name: 'Publication 485',
                        publicationInterval: 'weekly',
                      },
                    },
                  ],
                  editions: [
                    {
                      kind: ['component', 'editions', 'tablet'],
                      '@@skele/children': ['editions', 'latest'],
                      editions: [
                        {
                          kind: ['component', 'editions', 'item', 'tablet'],
                          edition: {
                            editionDefId: '483',
                            parentListId: '483',
                            isSubscribed: true,
                            date: {
                              year: 2018,
                              month: 7,
                              day: 21,
                            },
                            id: '7702630',
                          },
                          isLatest: true,
                          publicationName: 'Publication 483',
                        },
                        {
                          kind: ['component', 'editions', 'item', 'tablet'],
                          edition: {
                            editionDefId: '483',
                            parentListId: '483',
                            isSubscribed: true,
                            date: {
                              year: 2018,
                              month: 7,
                              day: 20,
                            },
                            id: '7702550',
                          },
                          publicationName: 'Publication 483',
                        },
                      ],
                      timestamp: 1537439073703,
                    },
                  ],
                  selectedPublication: 0,
                },
              },
            },
          ],
        },
      ],
    },
  }

  it('is faster than the library impl. in terms of get() /getIn() deep in the tree', () => {
    const im = fromJS(data)
    const path = [
      'content',
      'tabs',
      0,
      'scenes',
      0,
      'content',
      'publications',
      'editions',
      0,
      'editions',
      0,
    ]
    const oldCursor = OldCursor.from(im, path)
    const cursor = Cursor.from(im, path)

    new Suite()
      .add('get() (old)', () => {
        oldCursor.get('isLatest')
      })
      .add('get() (new)', () => {
        cursor.get('isLatest')
      })
      .add('getIn() (old)', function() {
        oldCursor.getIn(['edition', 'date', 'year'])
      })
      .add('getIn() / (new)', function() {
        cursor.getIn(['edition', 'date', 'year'])
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
