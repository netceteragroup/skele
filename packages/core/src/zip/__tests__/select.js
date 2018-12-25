'use strict'

import I from 'immutable'
import R from 'ramda'

import * as zip from '../'
import { childrenProperty, isOfKind, flow } from '../../data'

import { elementChild } from '../motion'
import { ofKind, propEq } from '../predicate'
import {
  ancestors,
  descendants,
  elementChildren,
  elementChildrenFor,
} from '../selector'
import { isStringArray, isLocationArray, select } from '../select'

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
    test('elementChildren', () => {
      const root = zipper(I.fromJS(data))

      const kids = elementChildren(root)

      expect(kids.length).toEqual(3)
      expect(
        flow(
          kids,
          R.path([0]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Murder Bot')
      expect(
        flow(
          kids,
          R.path([1]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Dr Mensah')
      expect(
        flow(
          kids,
          R.path([2]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Martha Wells')

      const extendedData = I.fromJS(data)
        .updateIn([childrenProperty], children => children.push('world'))
        .set('world', I.List.of(I.fromJS({ kind: ['world'], title: 'Alien' })))

      const newKidsOnTheBlock = elementChildren(zipper(extendedData))
      expect(newKidsOnTheBlock.length).toEqual(4)
      expect(
        flow(
          newKidsOnTheBlock,
          R.path([3]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Alien')
    })

    test('ancestors', () => {
      const root = zipper(I.fromJS(data))

      const settings = flow(
        root,
        elementChild('settings')
      )
      expect(
        flow(
          settings,
          zip.node,
          iprop('title')
        )
      ).toEqual('Martha Wells')

      const tabs = flow(
        root,
        elementChildrenFor('tabs')
      )
      expect(tabs.length).toEqual(2)

      const mensahChildren = flow(
        tabs,
        R.path([1]),
        elementChildren
      )
      expect(mensahChildren.length).toEqual(3)

      const deeplinkLoc = R.find(
        loc => isOfKind('link', zip.node(loc)),
        mensahChildren
      )
      expect(
        flow(
          deeplinkLoc,
          zip.node,
          iprop('title')
        )
      ).toEqual('goodreads')

      const robotLoc = R.find(
        loc =>
          isOfKind('element', zip.node(loc)) &&
          zip.node(loc).get('title') === 'robot',
        mensahChildren
      )
      expect(
        flow(
          robotLoc,
          zip.node,
          iprop('title')
        )
      ).toEqual('robot')

      const robotAncestors = ancestors(robotLoc)
      expect(robotAncestors.length).toEqual(4)
      expect(
        flow(
          robotAncestors,
          R.path([1]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Dr Mensah')
      expect(
        flow(
          robotAncestors,
          R.path([3]),
          zip.node,
          iprop('title')
        )
      ).toEqual('App')

      const deeplinkAncestors = ancestors(deeplinkLoc)
      expect(deeplinkAncestors.length).toEqual(4)
      expect(
        flow(
          deeplinkAncestors,
          R.path([1]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Dr Mensah')
      expect(
        flow(
          deeplinkAncestors,
          R.path([3]),
          zip.node,
          iprop('title')
        )
      ).toEqual('App')

      const settingsAncestors = ancestors(settings)
      expect(settingsAncestors.length).toEqual(2)
      expect(
        flow(
          settingsAncestors,
          R.path([1]),
          zip.node,
          iprop('title')
        )
      ).toEqual('App')
    })

    test('desendants', () => {
      const root = zipper(I.fromJS(data))

      const settings = flow(
        root,
        elementChild('settings')
      )
      expect(descendants(settings).length).toEqual(0)

      const tabs = elementChildrenFor('tabs')(root)
      const mensahDescendants = descendants(tabs[1])
      expect(mensahDescendants.length).toEqual(5)
      expect(
        flow(
          mensahDescendants,
          R.path([0]),
          zip.node,
          iprop('title')
        )
      ).toEqual('human')
      expect(
        flow(
          mensahDescendants,
          R.path([1]),
          zip.node,
          iprop('title')
        )
      ).toEqual('robot')
      expect(
        flow(
          mensahDescendants,
          R.path([2]),
          zip.node,
          iprop('title')
        )
      ).toEqual('goodreads')

      const all = descendants(root)
      expect(all.length).toEqual(10)
      expect(
        flow(
          all,
          R.path([0]),
          zip.node,
          iprop('title')
        )
      ).toEqual('human')
      expect(
        flow(
          all,
          R.path([1]),
          zip.node,
          iprop('title')
        )
      ).toEqual('robot')
      expect(
        flow(
          all,
          R.path([2]),
          zip.node,
          iprop('title')
        )
      ).toEqual('goodreads')
      expect(
        flow(
          all,
          R.path([5]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Dr Mensah')
      expect(
        flow(
          all,
          R.path([6]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Murder Bot')
      expect(
        flow(
          all,
          R.path([7]),
          zip.node,
          iprop('title')
        )
      ).toEqual('Martha Wells')
    })
  })

  describe('select', () => {
    const root = zipper(I.fromJS(data))

    it('should return array with given location for no predicates', () => {
      expect(
        flow(
          root,
          select()
        ).length
      ).toEqual(1)
      expect(
        flow(
          root,
          select(),
          R.path([0]),
          zip.node
        )
      ).toEqualI(zip.value(root))
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
        flow(
          root,
          select(descendants, ofKind('element')),
          R.prop('length')
        )
      ).toEqual(2)
      expect(
        flow(
          root,
          select(descendants, ofKind('tab'), propEq('title', 'Murder Bot')),
          R.prop('length')
        )
      ).toEqual(1)
      expect(
        flow(
          root,
          select(descendants, ['link']),
          R.prop('length')
        )
      ).toEqual(1)
      expect(
        flow(
          root,
          select(descendants, ['tab']),
          R.prop('length')
        )
      ).toEqual(2)
      expect(
        flow(
          root,
          select(descendants, ['tab'], 'deeplink'),
          R.prop('length')
        )
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
        flow(
          root,
          select(descendants, { prop: 'test' }),
          R.prop('length')
        )
      ).toEqual(0)
    })
  })
})
