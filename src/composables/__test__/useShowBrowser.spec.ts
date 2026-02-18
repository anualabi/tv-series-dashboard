import { beforeEach, describe, expect, test, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import { mount } from '@vue/test-utils'
import { useShowBrowser } from '@/composables/useShowBrowser'
import type { SearchResult, Show } from '@/types'
import { makeShow } from '@/__data__/show'

vi.mock('@/services/ShowService', () => ({
  default: {
    getShowsPage: vi.fn(),
    searchShows: vi.fn(),
  },
}))

vi.mock('@/utils/errors', () => ({
  toUserMessage: vi.fn((_: unknown, fallback: string) => fallback),
  isRequestCancelled: vi.fn(() => false),
}))

import ShowService from '@/services/ShowService'
import { isRequestCancelled, toUserMessage } from '@/utils/errors'

const getShowsPageMock = ShowService.getShowsPage as unknown as ReturnType<typeof vi.fn>
const searchShowsMock = ShowService.searchShows as unknown as ReturnType<typeof vi.fn>
const toUserMessageMock = toUserMessage as unknown as ReturnType<typeof vi.fn>
const isRequestCancelledMock = isRequestCancelled as unknown as ReturnType<typeof vi.fn>

const flushPromises = () => Promise.resolve()

function mountBrowser(opts = { debounceMs: 10, minQueryLength: 2, page: 0 }) {
  let api!: ReturnType<typeof useShowBrowser>

  const Host = defineComponent({
    setup() {
      api = useShowBrowser(opts)
      return { api }
    },
    template: '<div />',
  })

  mount(Host)
  return () => api
}

describe('useShowBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  test('loads initial dashboard on mount', async () => {
    getShowsPageMock.mockResolvedValue([makeShow({ id: 1 }), makeShow({ id: 2 })])

    const get = mountBrowser()
    await nextTick()
    await flushPromises()

    const api = get()
    expect(getShowsPageMock).toHaveBeenCalledWith(0)
    expect(api.isLoading.value).toBe(false)
    expect(api.errorMessage.value).toBe(null)
    expect(api.activeShows.value).toHaveLength(2)
  })

  test('maps initial load errors via toUserMessage', async () => {
    getShowsPageMock.mockRejectedValue(new Error('boom'))
    toUserMessageMock.mockReturnValue('Friendly')

    const get = mountBrowser()
    await nextTick()
    await flushPromises()

    const api = get()
    expect(toUserMessageMock).toHaveBeenCalled()
    expect(api.errorMessage.value).toBe('Friendly')
    expect(api.isLoading.value).toBe(false)
  })

  test('debounces search and calls service with AbortSignal', async () => {
    getShowsPageMock.mockResolvedValue([makeShow({ id: 1 })])
    const results: SearchResult[] = [
      { score: 1, show: makeShow({ id: 99, name: 'Planet Earth', genres: ['Nature'] }) },
    ]
    searchShowsMock.mockResolvedValue(results)

    const get = mountBrowser({ debounceMs: 50, minQueryLength: 2, page: 0 })
    await nextTick()
    await flushPromises()

    const api = get()
    api.query.value = 'pl'
    await nextTick()

    // not yet (debounced)
    expect(searchShowsMock).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    await flushPromises()

    expect(searchShowsMock).toHaveBeenCalledTimes(1)
    expect(searchShowsMock).toHaveBeenCalledTimes(1)
    expect(searchShowsMock).toHaveBeenCalledWith('pl', expect.any(AbortSignal))

    expect(api.isSearching.value).toBe(false)
    expect(api.activeShows.value[0]?.id).toBe(99)
  })

  test('does not execute search below minQueryLength', async () => {
    getShowsPageMock.mockResolvedValue([makeShow({ id: 1 })])
    const get = mountBrowser({ debounceMs: 10, minQueryLength: 3, page: 0 })

    await nextTick()
    await flushPromises()

    const api = get()
    api.query.value = 'ab' // length 2 < 3
    await nextTick()

    vi.advanceTimersByTime(10)
    await flushPromises()

    expect(searchShowsMock).not.toHaveBeenCalled()
    expect(api.isSearchMode.value).toBe(false)
  })

  test('showNoResults only true for latest completed query', async () => {
    getShowsPageMock.mockResolvedValue([makeShow({ id: 1 })])
    searchShowsMock.mockResolvedValue([]) // empty results

    const get = mountBrowser({ debounceMs: 10, minQueryLength: 2, page: 0 })
    await nextTick()
    await flushPromises()

    const api = get()
    api.query.value = 'zz'
    await nextTick()

    vi.advanceTimersByTime(10)
    await flushPromises()

    expect(api.showNoResults.value).toBe(true)

    // Change query; until new search completes, should not claim "no results" for the new query
    api.query.value = 'zzz'
    await nextTick()
    expect(api.showNoResults.value).toBe(false)
  })

  test('clearSearch resets state and prevents “no results”/errors lingering', async () => {
    getShowsPageMock.mockResolvedValue([makeShow({ id: 1 })])
    searchShowsMock.mockRejectedValue(new Error('boom'))
    toUserMessageMock.mockReturnValue('Search failed')

    const get = mountBrowser({ debounceMs: 10, minQueryLength: 2, page: 0 })
    await nextTick()
    await flushPromises()

    const api = get()
    api.query.value = 'aa'
    await nextTick()

    vi.advanceTimersByTime(10)
    await flushPromises()

    expect(api.searchError.value).toBe('Search failed')

    api.clearSearch()
    await nextTick()

    expect(api.query.value).toBe('')
    expect(api.searchError.value).toBe(null)
    expect(api.isSearching.value).toBe(false)
    expect(api.showNoResults.value).toBe(false)
  })

  test('ignores cancelled searches (does not surface an error)', async () => {
    getShowsPageMock.mockResolvedValue([makeShow({ id: 1 })])
    isRequestCancelledMock.mockReturnValue(true)
    searchShowsMock.mockRejectedValue({ code: 'ERR_CANCELED' })

    const get = mountBrowser({ debounceMs: 10, minQueryLength: 2, page: 0 })
    await nextTick()
    await flushPromises()

    const api = get()
    api.query.value = 'ab'
    await nextTick()

    vi.advanceTimersByTime(10)
    await flushPromises()

    expect(api.searchError.value).toBe(null)
  })
})
