'use strict';

import { Map, List } from 'immutable';
import isNil from 'lodash/isNil';


export default class Registry {

  constructor(keyExtractor) {
    this.recognizers = new List();
    this.registry = new Map();
    this.keyExtractor = keyExtractor;
  }

  register(kind, element): void {
    if (typeof kind === 'function') {
      this.recognizers = this.recognizers.push([kind, element]);
    } else {
      const adaptedKey = this._adaptKey(kind);
      this.registry = this.registry.set(adaptedKey, element);
    }
  }

  get(element, useSpecificity = true) {
    const resolvedKey = this._adaptKey(this.keyExtractor ? this.keyExtractor(element) : element);
    const obj = this._getBySpecificity(resolvedKey, useSpecificity);

    if (isNil(obj)) {
      return this._getWithRecognizer(resolvedKey);
    }

    return obj;
  }

  reset() {
    this.recognizers = new List();
    this.registry = new Map();
  }

  _adaptKey(key) {
    if (key instanceof List) {
      // cast
      return key;
    }

    if (Array.isArray(key)) {
      return List(key);
    }

    return List.of(key);
  }

  _getBySpecificity(key, useSpecificity) {
    if (key.isEmpty()) {
      return undefined;
    }

    const val = this.registry.get(key);

    if (val) {
      return val;
    }

    if (useSpecificity) {
      return this._getBySpecificity(key.butLast(), useSpecificity);
    }

    return undefined;
  }

  _getWithRecognizer(key) {
    const result = this.recognizers.find(r => r[0](key));

    if (result) {
      return result[1];
    }
  }
}

