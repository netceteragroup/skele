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

    test('is ok if it has a status of 2xx **and** it has a value', () => {
      expect(http.isOK({ value: 1, meta: { status: 222 } })).toBeTruthy()
      expect(http.isOK({ value: 1, meta: { status: 300 } })).not.toBeTruthy()
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

      expect(
        http.flow(
          resp,
          R.inc,
          R.add(10)
        )
      ).toEqual({
        value: 21,
      })

      expect(
        http.flow(
          http.failedResponse('Fail'),
          R.inc,
          R.add(10)
        )
      ).toEqual({
        meta: {
          status: 999,
          message: 'Fail',
        },
      })
    })

    test('a transform fn can return a response', () => {
      const resp = http.asResponse(10)

      expect(
        http.flow(
          resp,
          R.inc,
          () => http.asResponse('something'),
          R.length
        )
      ).toEqual({
        value: 9,
      })

      expect(
        http.flow(
          resp,
          R.inc,
          () => http.failedResponse('Fail'),
          R.dec
        )
      ).toEqual({
        meta: {
          status: 999,
          message: 'Fail',
        },
      })
    })
  })

  describe('HTTP methods', () => {
    beforeEach(() => {
      fetch.resetMocks()
      fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))
    })

    describe('execute/get', () => {
      test('just an uri', async () => {
        await http.execute('http://example.com')

        expect(fetch).toHaveBeenCalledWith(
          'http://example.com',
          expect.objectContaining({
            method: 'GET',
          })
        )
      })

      test('specifying a method', async () => {
        await http.execute('http://example.com', { method: 'HEAD' })

        expect(fetch).toHaveBeenCalledWith(
          'http://example.com',
          expect.objectContaining({
            method: 'HEAD',
          })
        )
      })

      test('extra headers', async () => {
        await http.execute('http://example.com', {
          headers: { 'Cache-Control': 'max-age=200' },
        })

        expect(fetch).toHaveBeenCalledWith(
          'http://example.com',
          expect.objectContaining({
            method: 'GET',
          })
        )

        expect(fetch.mock.calls[0][1].headers.get('Cache-Control')).toEqual(
          'max-age=200'
        )
      })

      test('revalidate option', async () => {
        await http.execute('http://example.com', {
          revalidate: true,
          headers: { Agent: 'x' },
        })

        expect(fetch).toHaveBeenCalledWith(
          'http://example.com',
          expect.objectContaining({
            method: 'GET',
          })
        )

        const headers = fetch.mock.calls[0][1].headers

        expect(headers.get('Cache-Control')).toEqual('max-age=0')
        expect(headers.get('Agent')).toEqual('x')
      })

      test('OK response', async () => {
        const response = await http.execute('http://example.com')

        expect(http.isResponse(response)).toBeTruthy()
        expect(http.isOK(response)).toBeTruthy()
        expect(response.value.toJS()).toEqual({ data: '12345' })
      })

      test('Failed response', async () => {
        fetch.resetMocks()
        fetch.mockResponseOnce(JSON.stringify({}), { status: 404 })

        const response = await http.execute('http://example.com')

        expect(http.isResponse(response)).toBeTruthy()
        expect(http.isOK(response)).not.toBeTruthy()
        expect(response.meta).toMatchObject({
          status: 404,
          message: 'Not Found',
        })
      })
    })

    describe('post/put/patch', () => {
      test('post', async () => {
        for (const m of ['post', 'put', 'patch']) {
          fetch.resetMocks()
          fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

          // eslint-disable-next-line import/namespace
          await http[m].call(
            http,
            'http://example.com',
            { test: 1 },
            {
              headers: { Agent: 'x' },
              foo: 'bar',
            }
          )

          expect(fetch).toHaveBeenCalledWith(
            'http://example.com',
            expect.objectContaining({
              method: m.toUpperCase(),
              foo: 'bar',
              body: JSON.stringify({ test: 1 }),
            })
          )

          const headers = fetch.mock.calls[0][1].headers
          expect(headers.get('Agent')).toEqual('x')
        }
      })
    })

    describe('options/head/delete', async () => {
      for (const m of ['options', 'head', 'delete']) {
        fetch.resetMocks()
        fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

        // eslint-disable-next-line import/namespace
        await http[m].call(http, 'http://example.com', {
          headers: { Agent: 'x' },
          foo: 'bar',
        })

        expect(fetch).toHaveBeenCalledWith(
          'http://example.com',
          expect.objectContaining({
            method: m.toUpperCase(),
            foo: 'bar',
          })
        )

        const headers = fetch.mock.calls[0][1].headers
        expect(headers.get('Agent')).toEqual('x')
      }
    })

    test('faild http call returns 998 as status code', async () => {
      fetch.resetMocks()
      fetch.mockReject()

      const response = await http.get('http://example.com')
      expect(response.meta.status).toEqual(998)
    })
  })
})
