import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { SearchResult, Show } from '@/types'
import { makeShow } from '@/__data__/show'

const mocks = vi.hoisted(() => {
  const get = vi.fn()
  const create = vi.fn(() => ({ get }))
  return { get, create }
})

vi.mock('axios', () => ({
  default: {
    create: mocks.create,
  },
}))

async function importService() {
  vi.resetModules()
  const mod = await import('@/services/ShowService')
  return mod.default
}

beforeEach(() => {
  mocks.create.mockClear()
  mocks.get.mockReset()
})

describe('ShowService', () => {
  test('creates axios client with expected config', async () => {
    await importService()

    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(mocks.create).toHaveBeenCalledWith({
      baseURL: 'https://api.tvmaze.com',
      withCredentials: false,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })

  test('getShowsPage calls /shows with page param and returns data', async () => {
    const ShowService = await importService()
    const data: Show[] = [makeShow({ id: 10 })]
    mocks.get.mockResolvedValueOnce({ data })

    await expect(ShowService.getShowsPage(3)).resolves.toEqual(data)
    expect(mocks.get).toHaveBeenCalledWith('/shows', { params: { page: 3 } })
  })

  test('searchShows calls /search/shows with q + signal and returns data', async () => {
    const ShowService = await importService()
    const data: SearchResult[] = [{ score: 1, show: makeShow({ id: 99 }) }]
    const signal = new AbortController().signal
    mocks.get.mockResolvedValueOnce({ data })

    await expect(ShowService.searchShows('pl', signal)).resolves.toEqual(data)
    expect(mocks.get).toHaveBeenCalledWith('/search/shows', {
      params: { q: 'pl' },
      signal,
    })
  })

  test('getShow calls /shows/:id and returns data', async () => {
    const ShowService = await importService()
    const data = makeShow({ id: 42 })
    mocks.get.mockResolvedValueOnce({ data })

    await expect(ShowService.getShow(42)).resolves.toEqual(data)
    expect(mocks.get).toHaveBeenCalledWith('/shows/42')
  })
})
