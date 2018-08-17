'use strict'

import { data } from '@skele/core'

export { actionMetaProperty as actionMeta } from './action'
export { fallback as readFallback } from './read'

const children = data.childrenProperty
export { children }
export const metadata = '@@skele/metadata'
