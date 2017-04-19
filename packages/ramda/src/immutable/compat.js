'use strict';

import I from 'immutable';

let isCollection, isIndexed, isAssociative, isKeyed, is;

is = I.is;

if (I.Iterable == null) {
  ({isCollection, isIndexed, isAssociative, isKeyed} = I);
} else {
  ({isIterable: isCollection, isIndexed, isAssociative, isKeyed} = I.Iterable);
}

export {
  isCollection,
  isIndexed,
  isAssociative,
  isKeyed,
  is
};
