'use strict';

import React from 'react';

import {
  Text,
  View
} from 'react-native';

function MetaError({ url, status, message }) {
  return (
    <View>
      <Text>Read Error</Text>
      <Text>{url}</Text>
      <Text>{status}</Text>
      <Text>{message}</Text>
    </View>
  );
}

MetaError.propTypes = {
  url: React.PropTypes.string.isRequired,
  status: React.PropTypes.number.isRequired,
  message: React.PropTypes.string.isRequired
};

export default MetaError;
