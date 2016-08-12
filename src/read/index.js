/* @flow */
'use strict';

import flow from 'lodash/flow';

// register default read elements
import './elements/read';
import './elements/loading';
import './elements/error';

import { register, fallback, httpRead } from './readRegistry';

register(fallback, httpRead);
