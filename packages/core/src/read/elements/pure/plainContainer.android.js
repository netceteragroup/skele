'use strict';

import React from 'react';

import { View } from 'react-native';

function PlainContainer({ elements }) {
  return (
    <View>
      {elements}
    </View>
  );
}

PlainContainer.propTypes = {
  elements: React.PropTypes.object
};

export default PlainContainer;
