'use strict';

import React from 'react';

import ui from '../../ui';

class Read extends React.Component {

  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    kind: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]).isRequired,
    uri: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch, kind, uri } = this.props;
    dispatch({type: 'READ', uri, kind});
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
      dispatch={dispatch} />
  );
});
