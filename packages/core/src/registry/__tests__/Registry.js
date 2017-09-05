'use strict'

import { List } from 'immutable'

import Registry from '../Registry'

describe('Registry', () => {
  const registry = new Registry()

  afterEach(() => registry.reset())

  it('can be created and used in key-value (map) fashion', () => {
    expect(registry.get('detective')).toEqual(undefined)

    registry.register('detective', 'Sherlock Holmes')
    expect(registry.get('detective')).toEqual('Sherlock Holmes')
  })

  it('allows arrays for keys', () => {
    registry.register(['a', 'b'], 1)

    expect(registry.get('detective')).toBeUndefined()
    expect(registry.get(['a', 'c'])).toBeUndefined()
    expect(registry.get(['a', 'b'])).toEqual(1)
  })

  it('allows lists for keys; can be used interexchangeably with arrays', () => {
    registry.register(['a', 'b'], 1)
    registry.register(List.of('c', 'd'), 2)

    expect(registry.get(List.of('a', 'b'))).toEqual(1)
    expect(registry.get(List.of('c', 'd'))).toEqual(2)
    expect(registry.get(['c', 'd'])).toEqual(2)
  })

  it('makes treats X and [X] equivalently', () => {
    registry.register('a', 1)
    registry.register(['b'], 2)

    expect(registry.get('a')).toEqual(1)
    expect(registry.get(['a'])).toEqual(1)

    expect(registry.get('b')).toEqual(2)
    expect(registry.get(['b'])).toEqual(2)
  })

  it('when using lists, performs lookups by lessening the specificity', () => {
    registry.register('a', 1)
    registry.register(['a', 'b'], 2)

    expect(registry.get('a')).toEqual(1)
    expect(registry.get(['a', 'b'])).toEqual(2)
    expect(registry.get(['a', 'c'])).toEqual(1)
    expect(registry.get(['a', 'c', 'b'])).toEqual(1)
    expect(registry.get(['a', 'b', 'c'])).toEqual(2)
  })

  it('it allows the empty list as a key, (effectively used as default value)', () => {
    registry.register([], -1)
    registry.register(['x'], 1)

    expect(registry.get([])).toEqual(-1)
    expect(registry.get('xyz')).toEqual(-1)
    expect(registry.get('x')).toEqual(1)
    expect(registry.get(['x', 'y'])).toEqual(1)
    expect(registry.get(['y', 'x'])).toEqual(-1)
  })

  it('forgets older registrations', () => {
    registry.register('x', 1)
    registry.register('x', 2)

    expect(registry.get('x')).toEqual(2)
  })

  // describe('is internally', () => {
  //   it('adapting keys into list', () => {
  //     const registry = new Registry()
  //
  //     // test fails because of toString method not present on 'undefined', invoked by chai-immutable in assert method
  //     // expect(registry._adaptKey()).to.not.equal(undefined);
  //
  //     expect(registry._adaptKey()).toEqual(List.of(undefined))
  //     expect(registry._adaptKey('teaser')).toEqual(List.of('teaser'))
  //     expect(registry._adaptKey(['teaser'])).toEqual(List.of('teaser'))
  //     expect(registry._adaptKey(['teaser', 'top'])).toEqual(
  //       List.of('teaser', 'top')
  //     )
  //     expect(registry._adaptKey(List.of('teaser', 'top'))).toEqual(
  //       List.of('teaser', 'top')
  //     )
  //   })
  //
  //   it('searching by specificity', () => {
  //     const registry = new Registry()
  //
  //     expect(registry._getBySpecificity(List.of('teaser'), true)).toEqual(
  //       undefined
  //     )
  //
  //     registry.register('teaser', 'teaserValue')
  //
  //     expect(registry._getBySpecificity(List.of('teaser'), true)).toEqual(
  //       'teaserValue'
  //     )
  //     expect(
  //       registry._getBySpecificity(List.of('teaser', 'top'), true)
  //     ).toEqual('teaserValue')
  //     expect(registry._getBySpecificity(List.of('banner'), true)).toEqual(
  //       undefined
  //     )
  //   })
  //
  //   it('searching with recognizer', () => {
  //     const registry = new Registry()
  //
  //     expect(registry._getWithRecognizer(List.of('special-image'))).toEqual(
  //       undefined
  //     )
  //
  //     const recognizer = key => key.first().indexOf('image') !== -1
  //
  //     registry.register(recognizer, 'imageValue')
  //
  //     expect(registry._getWithRecognizer(List.of('special-image'))).toEqual(
  //       'imageValue'
  //     )
  //   })
  // })
  //
  // describe('gets values', () => {
  //   it('by specificity first', () => {
  //     const registry = new Registry()
  //
  //     registry.register('teaser', 'teaserBySpecValue')
  //     registry.register(key => key.first() === 'teaser', 'teaserByRecoValue')
  //
  //     /*
  //      * We try to get [teaser,top] here. We have registered by specificity [teaser],
  //      * and by recognizer function. Since we are searching with useSpecificity on,
  //      * we should get the value with Spec
  //      */
  //     expect(registry.get(['teaser', 'top'], true)).toEqual('teaserBySpecValue')
  //   })
  //
  //   it('by recognizer if specificity not found', () => {
  //     const registry = new Registry()
  //
  //     registry.register('teaser', 'teaserBySpecValue')
  //     registry.register(key => key.first() === 'teaser', 'teaserByRecoValue')
  //
  //     /*
  //      * Here we use (useSpecificity off), so we should get the value
  //      * returned by going with recognizer
  //      */
  //     expect(registry.get(['teaser', 'top'], false)).toEqual(
  //       'teaserByRecoValue'
  //     )
  //   })
  // })
  //
  // it('can be reset', () => {
  //   const registry = new Registry()
  //
  //   registry.register('teaser', 'teaserBySpecValue')
  //   registry.register(key => key.first() === 'teaser', 'teaserByRecoValue')
  //
  //   registry.reset()
  //
  //   expect(registry.get(['teaser', 'top'])).not.toExist
  // })
  //
  // it('can be created with key extractor and elements driven (get) by data', () => {
  //   const registry = new Registry(element => element.get('kind'))
  //   const elementModel = fromJS({
  //     kind: 'teaser',
  //     value: 'a teaser',
  //   })
  //
  //   registry.register('teaser', 'teaserView')
  //   const result = registry.get(elementModel)
  //
  //   expect(result).toEqual('teaserView')
  // })
})
