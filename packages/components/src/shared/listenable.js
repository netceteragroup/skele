'use strict';

import React from 'react';

export default class Listenable extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.listeners = [];
  }

  _addListener = (callback) => {
    if (this.listeners.indexOf(callback) === -1) {
      this.listeners = [...this.listeners, callback];
    }
  };

  _removeListener = (callback) => {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      let listeners = [...this.listeners];
      listeners.splice(index, 1);
      this.listeners = listeners;
    }
  };

  _notifyListeners = (info) => {
    this.listeners.forEach(callback => {
      callback(info);
    });
  };

  render() {
    return null;
  }
}