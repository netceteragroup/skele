'use strict'

import { data, log, registry, zip } from '../'

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
  // from zippa
  // ...

  // from skele
  expect(zip.elementZipper).toEqual(anyFunction)
  expect(zip.reduce).toEqual(anyFunction)
  expect(zip.reducePre).toEqual(anyFunction)
  expect(zip.editCond).toEqual(anyFunction)
})

test('core.log interface', () => {
  expect(log.deprecated).toEqual(anyFunction)
  expect(log.info).toEqual(anyFunction)
  expect(log.warning).toEqual(anyFunction)
  expect(log.error).toEqual(anyFunction)
})
