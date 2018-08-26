'use strict'

import I from 'immutable'
import R from 'ramda'

import { elementZipper } from '../'
import { childrenProperty, isElement, isOfKind } from '../../data'

import {
  isStringArray,
  isLocationArray,
  child,
  ancestors,
  descendants,
  children,
  propEq,
  select,
  ofKind,
} from '../select'

const zipper = data => elementZipper({})(data)

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
    it('isStringArray', () => {
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
    it('isLocationArray', () => {
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
    it('child', () => {
      const root = zipper(I.fromJS(data))

      const storage = child('storage')(root)
      expect(storage).toBeNull()

      // works for child pointing to an element
      const settings = child('settings')(root).value()
      expect(isElement(settings)).toEqual(true)
      expect(settings.get('title')).toEqual('Martha Wells')

      // doesn't work for child pointing to a collection
      // TODO Andon: Check if this is correct (desired) behavior
      const tabs = child('tabs')(root)
      expect(tabs).toBeNull()
    })

    it('children', () => {
      const root = zipper(I.fromJS(data))

      const kids = children()(root)

      expect(kids.length).toEqual(3)
      expect(kids[0].value().get('title')).toEqual('Murder Bot')
      expect(kids[1].value().get('title')).toEqual('Dr Mensah')
      expect(kids[2].value().get('title')).toEqual('Martha Wells')

      const extendedData = I.fromJS(data)
        .updateIn([childrenProperty], children => children.push('world'))
        .set('world', I.List.of(I.fromJS({ kind: ['world'], title: 'Alien' })))

      const newKidsOnTheBlock = children()(zipper(extendedData))
      expect(newKidsOnTheBlock.length).toEqual(4)
      expect(newKidsOnTheBlock[3].value().get('title')).toEqual('Alien')
    })

    it('propEq', () => {
      const root = zipper(I.fromJS(data))

      expect(
        propEq(
          'settings',
          I.fromJS({ kind: ['settings'], title: 'Martha Wells' })
        )(root)
      ).toBeTruthy()
      expect(
        propEq('title', 'Martha Wells')(child('settings')(root))
      ).toBeTruthy()
    })

    it('ancestors', () => {
      const root = zipper(I.fromJS(data))

      const settings = child('settings')(root)
      expect(settings.value().get('title')).toEqual('Martha Wells')

      const tabs = children('tabs')(root)
      expect(tabs.length).toEqual(2)

      const mensahChildren = children()(tabs[1])
      expect(mensahChildren.length).toEqual(3)

      const deeplinkLoc = R.find(
        loc => isOfKind('link', loc.value()),
        mensahChildren
      )
      expect(deeplinkLoc.value().get('title')).toEqual('goodreads')

      const robotLoc = R.find(
        loc =>
          isOfKind('element', loc.value()) &&
          loc.value().get('title') === 'robot',
        mensahChildren
      )
      expect(robotLoc.value().get('title')).toEqual('robot')

      const robotAncestors = ancestors()(robotLoc)
      expect(robotAncestors.length).toEqual(2)
      expect(robotAncestors[0].value().get('title')).toEqual('Dr Mensah')
      expect(robotAncestors[1].value().get('title')).toEqual('App')

      const deeplinkAncestors = ancestors()(deeplinkLoc)
      expect(deeplinkAncestors.length).toEqual(2)
      expect(deeplinkAncestors[0].value().get('title')).toEqual('Dr Mensah')
      expect(deeplinkAncestors[1].value().get('title')).toEqual('App')

      const settingsAncestors = ancestors()(settings)
      expect(settingsAncestors.length).toEqual(1)
      expect(settingsAncestors[0].value().get('title')).toEqual('App')
    })

    it('desendants', () => {
      const root = zipper(I.fromJS(data))

      const settings = child('settings')(root)
      expect(descendants()(settings).length).toEqual(0)

      const tabs = children('tabs')(root)
      const mensahDescendants = descendants()(tabs[1])
      expect(mensahDescendants.length).toEqual(3)
      expect(mensahDescendants[0].value().get('title')).toEqual('human')
      expect(mensahDescendants[1].value().get('title')).toEqual('robot')
      expect(mensahDescendants[2].value().get('title')).toEqual('goodreads')

      const all = descendants()(root)
      expect(all.length).toEqual(6)
      expect(all[0].value().get('title')).toEqual('human')
      expect(all[1].value().get('title')).toEqual('robot')
      expect(all[2].value().get('title')).toEqual('goodreads')
      expect(all[3].value().get('title')).toEqual('Dr Mensah')
      expect(all[4].value().get('title')).toEqual('Murder Bot')
      expect(all[5].value().get('title')).toEqual('Martha Wells')
    })
  })
  describe('select', () => {
    const root = zipper(I.fromJS(data))

    it('should return array with given location for no predicates', () => {
      expect(select()(root).length).toEqual(1)
      expect(select()(root)[0].value()).toEqualI(root.value())
    })

    it('should give proper result for combinations of predicates', () => {
      expect(
        select(descendants(), propEq('title', 'goodreads'))(root).length
      ).toEqual(1)
      expect(select(descendants(), ofKind('element'))(root).length).toEqual(2)
      expect(
        select(descendants(), ofKind('tab'), propEq('title', 'Murder Bot'))(
          root
        ).length
      ).toEqual(1)
      expect(select(descendants(), ['link'])(root).length).toEqual(1)
      expect(select(descendants(), ['tab'])(root).length).toEqual(2)
      expect(select(descendants(), ['tab'], 'deeplink')(root).length).toEqual(1)
    })

    it('should hanlde gracefully in case unknown predicate creaps in', () => {
      expect(
        select(descendants(), loc => ({
          loc,
        }))(root).length
      ).toEqual(0)
      expect(select(descendants(), { prop: 'test' })(root).length).toEqual(0)
    })
  })
})
