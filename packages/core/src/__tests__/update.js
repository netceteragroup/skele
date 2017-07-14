'use strict';

import { mount } from 'enzyme';

import React from 'react';
import { fromJS } from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import { ui, update, Engine } from '..';

describe('updates API', function() {

  it('registers an update', function() {

    const action1 = {
      fromKind: ['article', 'specific'],
      type: 'TOGGLE_BOOKMARK'
    };
    const action2 = {
      fromKind: ['article'],
      type: '.LOAD'
    };

    update.register(action1.fromKind, elementRegistry => {
      elementRegistry.register(action1.type, () => {});
    });
    update.register(action2.fromKind, elementRegistry => {
      elementRegistry.register(action2.type, () => {});
    });
    update.register(action2.fromKind, elementRegistry => {
      elementRegistry.register(action2.type, () => {});
    });
    expect(update.forAction(action1)).toEqual(expect.anything());
    expect(update.forAction(action2)).toEqual(expect.anything());
    expect(update.forAction({ fromKind: 'unknown' })).not.toEqual(expect.anything());

    update.register(action1.fromKind, elementRegistry => {
      elementRegistry.register(action1.type, null);
    });
    update.register(action2.fromKind, elementRegistry => {
      elementRegistry.register(action2.type, null);
    });
    expect(update.forAction(action1)).not.toEqual(expect.anything());
    expect(update.forAction(action2)).not.toEqual(expect.anything());
  });

  it('returns a cursor upon invocation of the reducer function', function() {
    const data = fromJS({
      element1: {
        element2: {
          element3: {
            kind: ['article', 'specific']
          },
          kind: ['container']
        },
        kind: ['container']
      }
    });
    const cursor = Cursor.from(data, ['element1'], () => {});
    const localUpdate = {
      fromKind: ['article', 'specific'],
      fromPath: ['element2', 'element3'],
      type: 'TOGGLE_BOOKMARK'
    };
    const globalUpdate = {
      fromKind: ['container'],
      fromPath: [],
      type: '.TOGGLE_BOOKMARK'
    };
    const readUpdate = {
      fromKind: ['container'],
      fromPath: [],
      type: 'READ'
    };
    update.register(localUpdate.fromKind, elementRegistry => {
      elementRegistry.register(localUpdate.type, () => {});
    });
    update.register(globalUpdate.fromKind, elementRegistry => {
      elementRegistry.register(globalUpdate.type, () => {});
    });
    update.register(readUpdate.fromKind, elementRegistry => {
      elementRegistry.register(readUpdate.type, () => {});
    });

    expect(update.reducer({}, cursor, {})).toEqual(cursor);
    expect(update.reducer({}, cursor, localUpdate)).toEqual(expect.anything());
    expect(update.reducer({}, cursor, globalUpdate)).toEqual(expect.anything());
    expect(update.reducer({}, cursor, readUpdate)).toEqual(expect.anything());
  });

});


const appState = {
  kind: ['navigation', 'stack'],
  title: 'Navigation-Stack',
  children: [
    {
      kind: ['navigation', 'scene'],
      title: 'Scene-Home'
    },
    {
      kind: ['navigation', 'scene'],
      title: 'Scene-About'
    }
  ]
};

class Scene extends React.Component {

  static propTypes = {
    title: React.PropTypes.string.isRequired,
    dispatch: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch({type: 'UPDATE_TITLE'});
    this.props.dispatch({type: '.UPDATE_TITLE'});
  }

  render() {
    return (
      <div>
        <h2>{this.props.title}</h2>
      </div>
    );
  }
}

function registerStackAndScene() {
  ui.register(['navigation', 'stack'], ({ element, uiFor }) => {
    return (
      <div>
        <h1>{element.get('title')}</h1>
        <div>{uiFor('children')}</div>
      </div>
    );
  });
  ui.register(['navigation', 'scene'], ({ element, dispatch }) => {
    return (
      <Scene
        title={element.get('title')}
        button={element.get('button')}
        dispatch={dispatch}
      />
    );
  });
}

describe('Local Update', () => {

  beforeEach(() => {
    // register ui
    registerStackAndScene();

    // register local update
    update.register(['navigation', 'scene'], elementRegistry => {
      elementRegistry.register('UPDATE_TITLE', element => {
        if (element.get('title') === 'Scene-Home') {
          return element.set('title', 'Scene-Modified-Home');
        }
        return element;
      });
    });
  });

  afterEach(() => {
    ui.reset();
    update.reset();
  });

  it('should be applied only for the elements when triggered', () => {
    const engine = mount(<Engine initState={fromJS(appState)} />);
    const html = engine.html();
    expect(html).not.toContain('Scene-Non-Existant');
    expect(html).not.toContain('Scene-Home');
    expect(html).not.toContain('Navigation-Modified-Stack');
    expect(html).toContain('Scene-Modified-Home');
    expect(html).toContain('Scene-About');
    expect(html).toContain('Navigation-Stack');
  });
});

describe('Global Update', () => {

  beforeEach(() => {
    // register ui
    registerStackAndScene();

    // register global update
    update.register(['navigation', 'stack'], elementRegistry => {
      elementRegistry.register('.UPDATE_TITLE', element => element.set('title', 'Navigation-Modified-Stack'));
    });
  });

  afterEach(() => {
    ui.reset();
    update.reset();
  });

  it('should be applied only for the elements when triggered', () => {
    const engine = mount(<Engine initState={fromJS(appState)} />);
    const html = engine.html();
    expect(html).not.toContain('Scene-Non-Existant');
    expect(html).not.toContain('Scene-Modified-Home');
    expect(html).not.toContain('Navigation-Stack');
    expect(html).toContain('Scene-About');
    expect(html).toContain('Scene-Home');
    expect(html).toContain('Navigation-Modified-Stack');
  });
});
