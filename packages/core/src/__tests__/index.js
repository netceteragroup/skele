'use strict'

import { data, log, registry, zip, propNames } from '../'

const anyFunction = expect.any(Function)
const anyString = expect.any(String)

test('core.data interface', () => {
  // functions
  expect(data.flow).toEqual(anyFunction)
  expect(data.when).toEqual(anyFunction)
  expect(data.isOfKind).toEqual(anyFunction)
  expect(data.isElementRef).toEqual(anyFunction)
  expect(data.isExactlyOfKind).toEqual(anyFunction)
  expect(data.kindOf).toEqual(anyFunction)
  expect(data.isElement).toEqual(anyFunction)
  expect(data.ancestorKinds).toEqual(anyFunction)
  expect(data.canonical).toEqual(anyFunction)
  expect(data.pathsToChildElements).toEqual(anyFunction)
  expect(data.asList).toEqual(anyFunction)
  expect(data.childPositions).toEqual(anyFunction)

  // constants
  expect(data.childrenProperty).toEqual(anyString)
})

test('core.registry interface', () => {
  const {
    AbstractRegistry,
    Registry,
    MultivalueRegistry,
    PatternRegistry,
    RegistryChain,
    MultivalueRegistryChain,
    chainRegistries,
    chainMultivalueRegistries,
  } = registry

  expectRegistryToConformAbstractRegistry(new AbstractRegistry())
  expectRegistryToConformAbstractRegistry(new Registry())
  expectRegistryToConformAbstractRegistry(new MultivalueRegistry())
  expectRegistryToConformAbstractRegistry(new PatternRegistry())
  expectRegistryToConformAbstractRegistry(new RegistryChain())
  expectRegistryToConformAbstractRegistry(new MultivalueRegistryChain())
  expect(chainRegistries).toEqual(anyFunction)
  expect(chainMultivalueRegistries).toEqual(anyFunction)
})

const expectRegistryToConformAbstractRegistry = reg => {
  expect(reg.register).toEqual(anyFunction)
  expect(reg.get).toEqual(anyFunction)
  expect(reg.isEmpty).toEqual(anyFunction)
  expect(reg.reset).toEqual(anyFunction)
}

test('core.zip interface', () => {
  // elementZipper
  expect(zip.elementZipper).toEqual(anyFunction)

  // reduce
  expect(zip.reduce).toEqual(anyFunction)
  expect(zip.reducePre).toEqual(anyFunction)

  // edit
  expect(zip.editCond).toEqual(anyFunction)

  // walk
  expect(zip.preWalk).toEqual(anyFunction)
  expect(zip.postWalk).toEqual(anyFunction)

  // impl
  expect(zip.zipper).toEqual(anyFunction)
  expect(zip.makeZipper).toEqual(anyFunction)
  expect(zip.node).toEqual(anyFunction)
  expect(zip.value).toEqual(anyFunction)
  expect(zip.isBranch).toEqual(anyFunction)
  expect(zip.children).toEqual(anyFunction)
  expect(zip.makeNode).toEqual(anyFunction)
  expect(zip.path).toEqual(anyFunction)
  expect(zip.lefts).toEqual(anyFunction)
  expect(zip.rights).toEqual(anyFunction)
  expect(zip.down).toEqual(anyFunction)
  expect(zip.up).toEqual(anyFunction)
  expect(zip.root).toEqual(anyFunction)
  expect(zip.right).toEqual(anyFunction)
  expect(zip.left).toEqual(anyFunction)
  expect(zip.replace).toEqual(anyFunction)
  expect(zip.edit).toEqual(anyFunction)
  expect(zip.getChildren).toEqual(anyFunction)

  // motions
  expect(zip.elementChild).toEqual(anyFunction)

  // predicates
  expect(zip.ofKind).toEqual(anyFunction)
  expect(zip.propEq).toEqual(anyFunction)

  // selectors
  expect(zip.ancestors).toEqual(anyFunction)
  expect(zip.descendants).toEqual(anyFunction)
  expect(zip.elementChildren).toEqual(anyFunction)
  expect(zip.elementChildrenFor).toEqual(anyFunction)

  // select
  expect(zip.select).toEqual(anyFunction)
})

test('core.log interface', () => {
  expect(log.deprecated).toEqual(anyFunction)
  expect(log.info).toEqual(anyFunction)
  expect(log.warning).toEqual(anyFunction)
  expect(log.error).toEqual(anyFunction)
})

test('core.propNames interface', () => {
  expect(propNames.metadata).toEqual('@@skele/metadata')
  expect(propNames.children).toEqual('@@skele/children')
})
