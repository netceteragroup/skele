'use strict';

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { view } from 'redux-elm';

export default view(({ model, dispatch }) => (
  <View style={{paddingTop: 20}}>
    <Text>Hello from Root View. Test: {model.get('test')}</Text>
  </View>
));
