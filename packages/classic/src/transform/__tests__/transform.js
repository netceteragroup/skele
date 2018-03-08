'use strict'

import { fromJS } from 'immutable'

import * as Subsystem from '../../subsystem'
import * as Kernel from '../../kernel'

import transformSS from '..'

const app = Subsystem.create(() => ({
  name: 'app',
}))

describe('Transform Subsytem', () => {
  const kernel = Kernel.create(
    [transformSS, app],
    {},
    {
      data: {
        defaultChildPositions: ['content', 'children', 'left', 'right'],
      },
    }
  )

  const transformer = () => kernel.subsystems.transform.buildTransformer()

  const appState = {
    kind: 'app',
    url: 'https://someurl.com',
    content: {
      kind: ['scene'],
      metadata: {
        title: 'Title',
        description: 'Description',
      },
    },
  }

  const appStateMultiScene = {
    kind: 'app',
    url: 'https://someurl.com',
    content: [
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description',
        },
      },
      {
        kind: ['scene'],
        metadata: {
          title: 'Title2',
          description: 'Description2',
        },
      },
    ],
  }

  const appStateMultiSceneWithSubElements = {
    kind: 'app',
    url: 'https://someurl.com',
    content: [
      {
        kind: ['scene'],
        metadata: {
          title: 'Title',
          description: 'Description',
        },
        content: {
          kind: 'widget',
          title: 'Widget Title',
        },
      },
      {
        kind: ['scene'],
        metadata: {
          title: 'Title2',
          description: 'Description2',
        },
        content: [
          {
            kind: 'widget',
            title: 'Widget Title 1',
          },
          {
            kind: 'widget',
            title: 'Widget Title 2',
          },
        ],
      },
    ],
  }

  const appStateWithSubKinds = {
    kind: 'app',
    url: 'https://someurl.com',
    children: [
      {
        kind: ['scene', 'web'],
        metadata: {
          title: 'Title',
          description: 'Description',
        },
      },
      {
        kind: ['scene', 'web'],
        metadata: {
          title: 'Title2',
          description: 'Description2',
        },
      },
    ],
  }

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

  const appStateDualPanelSparse = {
    kind: 'app',
    url: 'https://someurl.com',
    children: [
      {
        kind: 'scene',
        left: {
          kind: 'panel',
          metadata: {
            title: 'Title left',
            description: 'Description',
          },
        },
      },
      {
        kind: 'scene',
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
      },
    ],
  }

  afterEach(() => {
    transformSS.transform.reset()
    app.transform.reset()
  })

  it(
    'allows multiple transformers for the same kind, ' +
      'Kernel.subsystemSequence determining the precedence',
    () => {
      app.transform.register(['scene'], element =>
        element.updateIn(['metadata', 'title'], t => t + '!')
      )

      transformSS.transform.register(['scene'], element =>
        element.updateIn(['metadata', 'title'], t => t + '*')
      )

      app.transform.register(['scene'], element =>
        element.updateIn(['metadata', 'title'], t => t + '#')
      )

      const tt = transformer()
      const transformed = tt(fromJS(appState))

      expect(transformed.getIn(['content', 'metadata', 'title'])).toEqual(
        'Title*!#'
      )
    }
  )

  it('should register and apply transformers with single scene', () => {
    app.transform.register(['scene'], element =>
      element.setIn(['metadata', 'title'], 'Home page')
    )
    app.transform.register(['app'], element =>
      element.set('url', 'http://newurl.com')
    )

    const transformedAppState = transformer()(fromJS(appState))

    expect(transformedAppState.get('url')).toEqual('http://newurl.com')
    expect(transformedAppState.getIn(['content', 'metadata', 'title'])).toEqual(
      'Home page'
    )
  })

  it('should register and apply transformers with multiple scenes', () => {
    app.transform.register(['scene'], element =>
      element.setIn(['metadata', 'title'], 'Home page')
    )
    app.transform.register(['app'], element =>
      element.set('url', 'http://newurl.com')
    )

    const transformedAppState = transformer()(fromJS(appStateMultiScene))

    expect(transformedAppState.get('url')).toEqual('http://newurl.com')
    expect(
      transformedAppState.getIn(['content', 0, 'metadata', 'title'])
    ).toEqual('Home page')
    expect(
      transformedAppState.getIn(['content', 1, 'metadata', 'title'])
    ).toEqual('Home page')
  })

  it('should register and apply multiple transfromers per kind', () => {
    app.transform.register(['scene'], element =>
      element.setIn(['metadata', 'title'], 'Home page')
    )
    app.transform.register(['scene'], element =>
      element.setIn(['metadata', 'description'], 'Home page description')
    )

    const transformedAppState = transformer()(fromJS(appState))

    expect(transformedAppState.getIn(['content', 'metadata', 'title'])).toEqual(
      'Home page'
    )
    expect(
      transformedAppState.getIn(['content', 'metadata', 'description'])
    ).toEqual('Home page description')
  })

  it('should register and apply transformers for multiple scenes with widgets', () => {
    app.transform.register(['scene'], element =>
      element.setIn(['metadata', 'title'], 'Home page')
    )
    app.transform.register(['app'], element =>
      element.set('url', 'http://newurl.com')
    )
    app.transform.register(['widget'], element =>
      element.set('title', 'New ' + element.get('title'))
    )

    const transformedAppState = transformer()(
      fromJS(appStateMultiSceneWithSubElements)
    )

    expect(
      transformedAppState.getIn(['content', 0, 'metadata', 'title'])
    ).toEqual('Home page')
    expect(
      transformedAppState.getIn(['content', 0, 'content', 'title'])
    ).toEqual('New Widget Title')
    expect(
      transformedAppState.getIn(['content', 1, 'content', 0, 'title'])
    ).toEqual('New Widget Title 1')
    expect(
      transformedAppState.getIn(['content', 1, 'content', 1, 'title'])
    ).toEqual('New Widget Title 2')
  })

  it('should apply transformer on sub-kind', () => {
    app.transform.register(['scene'], element =>
      element.setIn(['metadata', 'title'], 'Home page')
    )

    const transformedAppState = transformer()(fromJS(appStateWithSubKinds))

    expect(
      transformedAppState.getIn(['children', 0, 'metadata', 'title'])
    ).toEqual('Home page')
  })

  it('should apply transformer when there are multiple children elements', () => {
    app.transform.register('panel', element =>
      element.setIn(
        ['metadata', 'title'],
        element.getIn(['metadata', 'title']) + ' new'
      )
    )

    const transformedAppState = transformer()(fromJS(appStateDualPanel))

    expect(transformedAppState.getIn(['left', 'metadata', 'title'])).toEqual(
      'Title left new'
    )
    expect(
      transformedAppState.getIn(['right', 0, 'metadata', 'title'])
    ).toEqual('Title right 1 new')
    expect(
      transformedAppState.getIn(['right', 1, 'metadata', 'title'])
    ).toEqual('Title right 2 new')
  })

  it('should apply transformer when there are multiple children elements, but elements do not have all the specified children', () => {
    app.transform.register('panel', element =>
      element.setIn(
        ['metadata', 'title'],
        element.getIn(['metadata', 'title']) + ' new'
      )
    )

    const transformedAppState = transformer()(fromJS(appStateDualPanelSparse))

    expect(
      transformedAppState.getIn(['children', 0, 'left', 'metadata', 'title'])
    ).toEqual('Title left new')
    expect(
      transformedAppState.getIn([
        'children',
        1,
        'right',
        0,
        'metadata',
        'title',
      ])
    ).toEqual('Title right 1 new')
    expect(
      transformedAppState.getIn([
        'children',
        1,
        'right',
        1,
        'metadata',
        'title',
      ])
    ).toEqual('Title right 2 new')
  })
})
