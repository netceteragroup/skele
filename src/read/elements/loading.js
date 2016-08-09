'use strict';

import React from 'react';

import {
  Text,
  View,
  TouchableHighlight
} from 'react-native';

import ui from '../../ui';

class Loading extends React.Component {

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
    dispatch({type: 'READ_LOAD', contentRef, where, kind});
  }

  render() {
    return (
      <View>
        <Text>Loading View</Text>
      </View>
    );
  }
}

ui.register(['__loading'], ({ element, dispatch}) => {
  return (
    <Loading
      kind={element.get('kind')}
      contentRef={element.get('contentRef')}
      where={element.get('where', 'content')}
      dispatch={dispatch} />
  );
});
