'use strict'

import * as R from 'ramda'
import * as http from '../http'

describe('http', () => {
  describe('a response', () => {
    test('is a response if it has a value', () => {
      expect(http.isResponse(null)).not.toBeTruthy()
      expect(http.isResponse('')).not.toBeTruthy()
      expect(http.isResponse([])).not.toBeTruthy()
      expect(http.isResponse({ A: 1 })).not.toBeTruthy()

      expect(http.isResponse({ value: 1 })).toBeTruthy()
      expect(http.isResponse({ value: 2, meta: { status: 500 } })).toBeTruthy()
    })

    test('is a response if it has a status code', () => {
      expect(http.isResponse({ meta: {} })).not.toBeTruthy()
      expect(http.isResponse({ meta: { status: 300 } })).toBeTruthy()
    })
    test('is ok if it has a value, and no meta', () => {
      expect(http.isOK({ value: 1 })).toBeTruthy()
      expect(http.isOK({ meta: {} })).not.toBeTruthy()
    })

    test('is ok if it has a status of 2xx or 3xx **and** it has a value', () => {
      expect(http.isOK({ value: 1, meta: { status: 222 } })).toBeTruthy()
      expect(http.isOK({ value: 1, meta: { status: 300 } })).toBeTruthy()
      expect(http.isOK({ value: 1, meta: { status: 200 } })).toBeTruthy()
      expect(http.isOK({ meta: { status: 200 } })).not.toBeTruthy()
    })

    test('obtaining a response from a value', () => {
      expect(http.asResponse(1)).toEqual({ value: 1 })
      expect(http.asResponse(1, 'http://example.com')).toEqual({
        value: 1,
        meta: {
          status: 200,
          message: 'OK',
          uri: 'http://example.com',
          url: 'http://example.com',
        },
      })
    })
    expect(http.failedResponse('Fail')).toEqual({
      meta: {
        status: 999,
        message: 'Fail',
      },
    })
    expect(http.failedResponse('Fail', 'http://example.com')).toEqual({
      meta: {
        status: 999,
        message: 'Fail',
        uri: 'http://example.com',
        url: 'http://example.com',
      },
    })
    expect(http.failedResponse('Fail', 42, 'http://example.com')).toEqual({
      value: 42,
      meta: {
        status: 999,
        message: 'Fail',
        uri: 'http://example.com',
        url: 'http://example.com',
      },
    })
  })

  describe('flow', () => {
    test('chains transformation fns on the value of a OK responise', () => {
      const resp = http.asResponse(10)

      expect(http.flow(resp, R.inc, R.add(10))).toEqual({
        value: 21,
      })

      expect(http.flow(http.failedResponse('Fail'), R.inc, R.add(10))).toEqual({
        meta: {
          status: 999,
          message: 'Fail',
        },
      })
    })

    test('a transform fn can return a response', () => {
      const resp = http.asResponse(10)

      expect(
        http.flow(resp, R.inc, () => http.asResponse('something'), R.length)
      ).toEqual({
        value: 9,
      })

      expect(
        http.flow(resp, R.inc, () => http.failedResponse('Fail'), R.dec)
      ).toEqual({
        meta: {
          status: 999,
          message: 'Fail',
        },
      })
    })
  })

  describe('execute', () => {
    test('faild http call returns 998 as status code', async () => {
      fetch.mockReject()

      const response = await http.get('http://example.com')
      expect(response.meta.status).toEqual(998)
    })
  })
})
