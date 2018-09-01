'use strict'

import I from 'immutable'
import R from 'ramda'

import * as zip from '../'
import { childrenProperty, isElement, isOfKind, flow } from '../../data'

import {
  isStringArray,
  isLocationArray,
  child,
  ancestors,
  descendants,
  children,
  childrenFor,
  propEq,
  select,
  ofKind,
} from '../select'

const iprop = R.invoker(1, 'get')

const zipper = data => zip.elementZipper({})(data)

const data = {
  kind: ['navigation', 'tabs'],
  [childrenProperty]: ['tabs', 'settings'],
  title: 'App',
  tabs: [
    {
      kind: ['tab'],
      title: 'Murder Bot',
    },
    {
      kind: ['tab'],
      title: 'Dr Mensah',
      [childrenProperty]: ['elements', 'deeplink'],
      elements: [
        {
          kind: ['element'],
          title: 'robot',
        },
        {
          kind: ['element'],
          title: 'human',
        },
      ],
      deeplink: {
        kind: ['link'],
        title: 'goodreads',
      },
    },
  ],
  settings: {
    kind: ['settings'],
    title: 'Martha Wells',
  },
}

describe('zip.select', () => {
  describe('helpers', () => {
    test('isStringArray', () => {
      expect(isStringArray(['string', 'test'])).toEqual(true)
      expect(isStringArray(['string', null])).toEqual(false)
      expect(isStringArray(['string', undefined])).toEqual(false)
      expect(isStringArray([{}, 'test'])).toEqual(false)
      expect(isStringArray(['string', []])).toEqual(false)
      expect(isStringArray([[]])).toEqual(false)
      expect(isStringArray([])).toEqual(true)
      expect(isStringArray(null)).toEqual(false)
      expect(isStringArray(undefined)).toEqual(false)
    })
    test('isLocationArray', () => {
      expect(isLocationArray()).toEqual(false)
      expect(isLocationArray(null)).toEqual(false)
      expect(isLocationArray(undefined)).toEqual(false)
      expect(isLocationArray([])).toEqual(false)
      expect(isLocationArray(['test'])).toEqual(false)
      expect(isLocationArray([zipper(I.fromJS(data))])).toEqual(true)
      expect(
        isLocationArray([zipper(I.fromJS(data)), zipper(I.fromJS(data))])
      ).toEqual(true)
      expect(
        isLocationArray([
          zipper(I.fromJS(data)),
          'Not a Zipper',
          zipper(I.fromJS(data)),
        ])
      ).toEqual(false)
    })
  })

  describe('predicates', () => {
    test('child', () => {
      const root = zipper(I.fromJS(data))

      const storage = flow(root, child('storage'))
      expect(storage).toBeNull()

      // child pointing to a non-collection element
      const settings = flow(root, child('settings'), zip.value)
      expect(isElement(settings)).toEqual(true)
      expect(settings.get('title')).toEqual('Martha Wells')

      // child positioning to the first element of a collection
      const firstTab = flow(root, child('tabs'), zip.value)
      expect(isElement(firstTab)).toEqual(true)
      expect(firstTab.get('title')).toEqual('Murder Bot')
    })

    test('children', () => {
      const root = zipper(I.fromJS(data))

      const kids = children(root)

      expect(kids.length).toEqual(3)
      expect(flow(kids, R.path([0]), zip.value, iprop('title'))).toEqual(
        'Murder Bot'
      )
      expect(flow(kids, R.path([1]), zip.value, iprop('title'))).toEqual(
        'Dr Mensah'
      )
      expect(flow(kids, R.path([2]), zip.value, iprop('title'))).toEqual(
        'Martha Wells'
      )

      const extendedData = I.fromJS(data)
        .updateIn([childrenProperty], children => children.push('world'))
        .set('world', I.List.of(I.fromJS({ kind: ['world'], title: 'Alien' })))

      const newKidsOnTheBlock = children(zipper(extendedData))
      expect(newKidsOnTheBlock.length).toEqual(4)
      expect(
        flow(newKidsOnTheBlock, R.path([3]), zip.value, iprop('title'))
      ).toEqual('Alien')
    })

    test('propEq', () => {
      const root = zipper(I.fromJS(data))

      expect(
        flow(
          root,
          propEq(
            'settings',
            I.fromJS({ kind: ['settings'], title: 'Martha Wells' })
          )
        )
      ).toBeTruthy()
      expect(
        flow(root, child('settings'), propEq('title', 'Martha Wells'))
      ).toBeTruthy()
    })

    test('ancestors', () => {
      const root = zipper(I.fromJS(data))

      const settings = flow(root, child('settings'))
      expect(flow(settings, zip.value, iprop('title'))).toEqual('Martha Wells')

      const tabs = flow(root, childrenFor('tabs'))
      expect(tabs.length).toEqual(2)

      const mensahChildren = flow(tabs, R.path([1]), children)
      expect(mensahChildren.length).toEqual(3)

      const deeplinkLoc = R.find(
        loc => isOfKind('link', loc.value()),
        mensahChildren
      )
      expect(flow(deeplinkLoc, zip.value, iprop('title'))).toEqual('goodreads')

      const robotLoc = R.find(
        loc =>
          isOfKind('element', loc.value()) &&
          loc.value().get('title') === 'robot',
        mensahChildren
      )
      expect(flow(robotLoc, zip.value, iprop('title'))).toEqual('robot')

      const robotAncestors = ancestors(robotLoc)
      expect(robotAncestors.length).toEqual(2)
      expect(
        flow(robotAncestors, R.path([0]), zip.value, iprop('title'))
      ).toEqual('Dr Mensah')
      expect(
        flow(robotAncestors, R.path([1]), zip.value, iprop('title'))
      ).toEqual('App')

      const deeplinkAncestors = ancestors(deeplinkLoc)
      expect(deeplinkAncestors.length).toEqual(2)
      expect(
        flow(deeplinkAncestors, R.path([0]), zip.value, iprop('title'))
      ).toEqual('Dr Mensah')
      expect(
        flow(deeplinkAncestors, R.path([1]), zip.value, iprop('title'))
      ).toEqual('App')

      const settingsAncestors = ancestors(settings)
      expect(settingsAncestors.length).toEqual(1)
      expect(
        flow(settingsAncestors, R.path([0]), zip.value, iprop('title'))
      ).toEqual('App')
    })

    test('desendants', () => {
      const root = zipper(I.fromJS(data))

      const settings = flow(root, child('settings'))
      expect(descendants(settings).length).toEqual(0)

      const tabs = childrenFor('tabs')(root)
      const mensahDescendants = descendants(tabs[1])
      expect(mensahDescendants.length).toEqual(3)
      expect(
        flow(mensahDescendants, R.path([0]), zip.value, iprop('title'))
      ).toEqual('human')
      expect(
        flow(mensahDescendants, R.path([1]), zip.value, iprop('title'))
      ).toEqual('robot')
      expect(
        flow(mensahDescendants, R.path([2]), zip.value, iprop('title'))
      ).toEqual('goodreads')

      const all = descendants(root)
      expect(all.length).toEqual(6)
      expect(flow(all, R.path([0]), zip.value, iprop('title'))).toEqual('human')
      expect(flow(all, R.path([1]), zip.value, iprop('title'))).toEqual('robot')
      expect(flow(all, R.path([2]), zip.value, iprop('title'))).toEqual(
        'goodreads'
      )
      expect(flow(all, R.path([3]), zip.value, iprop('title'))).toEqual(
        'Dr Mensah'
      )
      expect(flow(all, R.path([4]), zip.value, iprop('title'))).toEqual(
        'Murder Bot'
      )
      expect(flow(all, R.path([5]), zip.value, iprop('title'))).toEqual(
        'Martha Wells'
      )
    })
  })

  describe('select', () => {
    const root = zipper(I.fromJS(data))

    it('should return array with given location for no predicates', () => {
      expect(flow(root, select()).length).toEqual(1)
      expect(flow(root, select(), R.path([0]), zip.value)).toEqualI(
        root.value()
      )
    })

    it('should give proper result for combinations of predicates', () => {
      expect(
        flow(
          root,
          select(descendants, propEq('title', 'goodreads')),
          R.prop('length')
        )
      ).toEqual(1)
      expect(
        flow(root, select(descendants, ofKind('element')), R.prop('length'))
      ).toEqual(2)
      expect(
        flow(
          root,
          select(descendants, ofKind('tab'), propEq('title', 'Murder Bot')),
          R.prop('length')
        )
      ).toEqual(1)
      expect(
        flow(root, select(descendants, ['link']), R.prop('length'))
      ).toEqual(1)
      expect(
        flow(root, select(descendants, ['tab']), R.prop('length'))
      ).toEqual(2)
      expect(
        flow(root, select(descendants, ['tab'], 'deeplink'), R.prop('length'))
      ).toEqual(1)
    })

    it('should hanlde gracefully in case unknown predicate creaps in', () => {
      expect(
        flow(
          root,
          select(descendants, loc => ({
            loc,
          })),
          R.prop('length')
        )
      ).toEqual(0)
      expect(
        flow(root, select(descendants, { prop: 'test' }), R.prop('length'))
      ).toEqual(0)
    })
  })
})
