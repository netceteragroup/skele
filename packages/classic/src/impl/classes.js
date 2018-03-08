/* @flow */
'use strict'

export function isSubclassOf(SubClass, ParentClass) {
  return SubClass.prototype instanceof ParentClass || SubClass === ParentClass
}
