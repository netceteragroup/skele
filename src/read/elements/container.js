'use strict';

import React from 'react';

import {
  Text,
  View
} from 'react-native';

import ui from '../../ui';

ui.register(['__container'], ({ element }) => {
  // TODO andon: create universal component
  return (
    <View>
      {ui.forElements(element.get('content'))}
    </View>
  );
});
