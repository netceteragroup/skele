'use strict';

import I from 'immutable';

let isCollection, isIndexed, isAssociative, isKeyed, is, isSet, isList;

is = I.is;

if (I.Iterable == null) {
  ({isCollection, isIndexed, isAssociative, isKeyed} = I);
} else {
  ({isIterable: isCollection, isIndexed, isAssociative, isKeyed} = I.Iterable);
}

isSet = I.Set.isSet;
isList = I.List.isList;

export {
  isCollection,
  isIndexed,
  isAssociative,
  isKeyed,
  is,
  isSet,
  isList
};
