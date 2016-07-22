'use strict';

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight
} from 'react-native';

import { register as registerUI } from '../ui';
import { register as registerUpdate } from '../update/updateRegistry';

const ui = registerUI(['element', 'bookmark'], ({ element, dispatch }) => {
  const text = element.get('bookmarked') ? 'YES' : 'NO';
  return (
    <View style={{paddingTop: 20}}>
      <Text>Bookmark: {text}</Text>
      <TouchableHighlight
          onPress={() => dispatch({ type: 'BOOKMARK', payload: !element.get('bookmarked')})} >
        <Text>Toggle Bookmark!</Text>
      </TouchableHighlight>
    </View>
  )
});

const update = registerUpdate(['element', 'bookmark'], (elementRegistry) => {
  elementRegistry.register('BOOKMARK', (element, action) => element.set('bookmarked', action.payload));
});

export default {
  ui,
  update
}
