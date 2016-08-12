'use strict';

import React from 'react';

import {
  Text,
  View
} from 'react-native';

import ui from '../../ui';

ui.register(['__error'], ({ element }) => {
  const meta = element.get('meta');
  // TODO andon: create universal component
  return (
    <View>
      <Text>Read Error</Text>
      <Text>{meta.get('url')}</Text>
      <Text>{meta.get('status')}</Text>
      <Text>{meta.get('message')}</Text>
    </View>
  );
});
