'use strict'

import * as I from 'immutable'
import * as R from 'ramda'

import { propNames, data } from '../../'

import * as zip from '../index'

describe('selectors', () => {
  const nba = zip.elementZipper({})(
    I.fromJS({
      kind: 'league',
      [propNames.children]: ['teams', 'stats'],
      teams: [
        {
          kind: 'team',
          name: 'lakers',
          [propNames.children]: 'players',
          players: [
            {
              kind: 'player',
              name: 'lebron',
            },
            {
              kind: 'player',
              name: 'kuzma',
            },
            {
              kind: 'player',
              name: 'lonzo',
            },
          ],
        },
        {
          kind: 'team',
          name: 'dallas',
          [propNames.children]: 'players',
          players: [
            {
              kind: 'player',
              name: 'luka',
            },
            {
              kind: 'player',
              name: 'dirk',
            },
            {
              kind: 'player',
              name: 'jordan',
            },
          ],
        },
        {
          kind: 'team',
          name: 'warriors',
          [propNames.children]: 'players',
          players: [
            {
              kind: 'player',
              name: 'curry',
            },
            {
              kind: 'player',
              name: 'kd',
            },
            {
              kind: 'player',
              name: 'green',
            },
          ],
        },
      ],
      stats: [
        {
          kind: 'stat',
          name: 'reb',
        },
        {
          kind: 'stat',
          name: 'ass',
        },
        {
          kind: 'stat',
          name: 'poi',
        },
      ],
    })
  )
  describe('elementChildrenFor', () => {
    test('w/o key', () => {
      const elements = data.flow(
        nba,
        zip.elementChildrenFor(null)
      )

      expect(elements.length).toBe(6)

      const teams = R.reduce(
        (acc, el) => (zip.ofKind('team', el) ? acc.push(el) && acc : acc),
        [],
        elements
      )
      expect(teams.length).toBe(3)
      expect(zip.node(teams[0]).get('name')).toBe('lakers')

      const stats = R.reduce(
        (acc, el) => (zip.ofKind('stat', el) ? acc.push(el) && acc : acc),
        [],
        elements
      )
      expect(stats.length).toBe(3)
      expect(zip.node(stats[2]).get('name')).toBe('poi')
    })

    test('w/ key', () => {
      const teams = data.flow(
        nba,
        zip.elementChildrenFor('teams')
      )

      expect(teams.length).toBe(3)
      expect(zip.node(teams[1]).get('name')).toBe('dallas')

      const stats = data.flow(
        nba,
        zip.elementChildrenFor('stats')
      )

      expect(stats.length).toBe(3)
      expect(zip.node(stats[1]).get('name')).toBe('ass')
    })
  })
})
