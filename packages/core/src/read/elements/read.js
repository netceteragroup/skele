'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import ui from '../../ui';

class Read extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    kind: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    uri: PropTypes.string.isRequired,
    revalidate: PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch, kind, uri, revalidate } = this.props;
    dispatch({type: 'READ', uri, kind, revalidate});
  }

  render() {
    return null;
  }
}

ui.register(['__read'], ({ element, dispatch }) => {
  return (
    <Read
      kind={element.get('kind').toJS()}
      uri={element.get('uri')}
      dispatch={dispatch}
      revalidate={element.get('revalidate')}
    />
  );
});
