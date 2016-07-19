'use strict';

import React from 'react';
import { fromJS } from 'immutable';
import * as ui from '../../src/ui';

const elementModel = fromJS({
  kind: ['navigation', 'stack'],
  name: 'Sherlock'
});

const Element = ui.register(['navigation', 'stack'], ({model, dispatch, uiFor}) => {
  return (
    <div>${model.get('name')}</div>
  );
});

<Element model={elementModel} dispatch={action => console.log('action')} />

// TODO andon: file wip...
