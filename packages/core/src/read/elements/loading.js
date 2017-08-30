'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import ActivityIndicator from './pure/activityIndicator';

import ui from '../../ui';

class Loading extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    kind: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    uri: PropTypes.string.isRequired,
    readId: PropTypes.string.isRequired,
    revalidate: PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ActivityIndicator />
    );
  }
}

ui.register(['__loading'], ({ element, dispatch}) => {
  return (
    <Loading
      kind={element.get('kind').toJS()}
      uri={element.get('uri')}
      dispatch={dispatch}
      readId={element.get('readId')}
      revalidate={element.get('revalidate')}
    />
  );
});
