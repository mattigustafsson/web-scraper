import { expect, describe, it } from "bun:test"
import MockAdapter from 'axios-mock-adapter'
import axios from "axios"

import { getPage } from '../src/index'

const mock = new MockAdapter(axios)

describe('getPage', () => {
  it('should fetch and return page content', async () => {
    const url = 'https://example.com'
    const data = '<html><body>Hello, world!</body></html>'
    
    mock.onGet(url).reply(200, data)

    const result = await getPage(url)
    expect(result).toBe(data)
  })

  it('should throw an error if the request fails', async () => {
    const url = 'https://example.com/fail'

    mock.onGet(url).reply(400)

    expect(getPage(url)).rejects.toThrow()
  })
})
