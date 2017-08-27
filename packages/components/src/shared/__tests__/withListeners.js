'use strict';

import React from 'react';
import { shallow } from 'enzyme';
import WithListeners from '../withListeners';

describe('withListeners HOC', () => {

  class TestComponent {}
  const TestComponentWithListeners = WithListeners(TestComponent);
  const instance = shallow(<TestComponentWithListeners />).instance();
  let counter = 0;
  const callback1 = () => counter = counter + 1;
  const callback2 = () => counter = counter + 2;

  it('correctly adds listeners', () => {
    expect(instance.listeners.length).toEqual(0);
    instance._addListener(callback1);
    expect(instance.listeners.length).toEqual(1);
    instance._addListener(callback1);
    expect(instance.listeners.length).toEqual(1);
    instance._addListener(callback2);
    expect(instance.listeners.length).toEqual(2);
  });

  it('correctly notifies listeners', () => {
    expect(counter).toEqual(0);
    instance._notifyListeners();
    expect(counter).toEqual(3);
    instance._removeListener(callback2);
    instance._notifyListeners();
    expect(counter).toEqual(4);
    instance._addListener(callback2);
    instance._notifyListeners();
    expect(counter).toEqual(7);
  });

  it('correctly removes listeners', () => {
    expect(instance.listeners.length).toEqual(2);
    instance._removeListener(callback1);
    expect(instance.listeners.length).toEqual(1);
    instance._removeListener(callback1);
    expect(instance.listeners.length).toEqual(1);
    instance._removeListener(callback2);
    expect(instance.listeners.length).toEqual(0);
    instance._removeListener(callback2);
    expect(instance.listeners.length).toEqual(0);
  });

});