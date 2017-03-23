/* @flow */
'use strict';

import { List } from 'immutable';

/**
 * A path element within the application state.
 */
export type PathElem = string | number;

/**
 * A canonical representation of path elements.
 */
export type PathCanonical = Array<PathElem>;

/**
 * A path representation.
 */
export type Path = PathCanonical | PathElem;

/**
 * The canonical element reference type.
 */
export type ElementRefCanonical = List<string>;

/**
 * A type describing an element kind.
 */
export type ElementRef = string | Array<string> | ElementRefCanonical;
