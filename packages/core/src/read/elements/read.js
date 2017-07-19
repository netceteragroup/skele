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
    uri: React.PropTypes.string.isRequired,
    where: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch, kind, uri, where } = this.props;
    dispatch({type: 'READ', uri, where, kind});
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
      where={element.get('where', 'content')}
      dispatch={dispatch} />
  );
});
