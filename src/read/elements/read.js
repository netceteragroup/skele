'use strict';

import React from 'react';

import ui from '../../ui';

class Read extends React.Component {

  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    // TODO andon: prop validation for kind
    // kind: React.PropTypes.object.isRequired,
    contentRef: React.PropTypes.string.isRequired,
    where: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { dispatch, kind, contentRef, where } = this.props;
    dispatch({type: 'READ', contentRef, where, kind});
  }

  render() {
    return null;
  }
}

ui.register(['__read'], ({ element, dispatch }) => {
  return (
    <Read
      kind={element.get('kind')}
      contentRef={element.get('contentRef')}
      where={element.get('where', 'content')}
      dispatch={dispatch} />
  );
});
