'use strict';

import React from 'react';

import PlainContainer from './pure/plainContainer';

import ui from '../../ui';

ui.register(['__container'], ({ element }) => {
  return (
    <PlainContainer elements={ui.forElements(element.get('content'))} />
  );
});
