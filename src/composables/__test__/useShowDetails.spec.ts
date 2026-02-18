import { beforeEach, describe, expect, test, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'

import { useShowDetails } from '@/composables/useShowDetails'
import type { Show } from '@/types'
import { makeShow } from '@/__data__/show'

vi.mock('@/services/ShowService', () => ({
  default: { getShow: vi.fn() },
}))
vi.mock('@/utils/errors', () => ({
  toUserMessage: vi.fn((e: unknown, fallback: string) => fallback),
}))

import ShowService from '@/services/ShowService'
import { toUserMessage } from '@/utils/errors'

const getShowMock = ShowService.getShow as unknown as ReturnType<typeof vi.fn>
const toUserMessageMock = toUserMessage as unknown as ReturnType<typeof vi.fn>

const flushPromises = () => Promise.resolve()

describe('useShowDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('fetches immediately and stores the show', async () => {
    getShowMock.mockResolvedValue(makeShow({ id: 42, name: 'Planet Earth' }))

    const showId = ref(42)
    const { show, isLoading, errorMessage } = useShowDetails(showId)

    // watch immediate triggers fetch on next tick
    await nextTick()
    await flushPromises()

    expect(getShowMock).toHaveBeenCalledWith(42)
    expect(show.value?.name).toBe('Planet Earth')
    expect(errorMessage.value).toBe(null)
    expect(isLoading.value).toBe(false)
  })

  test('validates id (<=0/NaN) without calling service', async () => {
    getShowMock.mockResolvedValue(makeShow())

    const showId = ref(Number.NaN)
    const { show, isLoading, errorMessage } = useShowDetails(showId)

    await nextTick()

    expect(getShowMock).not.toHaveBeenCalled()
    expect(show.value).toBe(null)
    expect(isLoading.value).toBe(false)
    expect(errorMessage.value).toBe('Invalid show id.')

    showId.value = 0
    await nextTick()
    expect(getShowMock).not.toHaveBeenCalled()
    expect(errorMessage.value).toBe('Invalid show id.')
  })

  test('maps errors via toUserMessage and clears show', async () => {
    const err = new Error('boom')
    getShowMock.mockRejectedValue(err)
    toUserMessageMock.mockReturnValue('Friendly message')

    const showId = ref(7)
    const { show, errorMessage, isLoading } = useShowDetails(showId)

    await nextTick()
    await Promise.resolve()

    expect(toUserMessageMock).toHaveBeenCalledWith(
      err,
      'Failed to load show details. Please try again.',
    )
    expect(show.value).toBe(null)
    expect(errorMessage.value).toBe('Friendly message')
    expect(isLoading.value).toBe(false)
  })

  test('ignores stale responses when id changes quickly (race guard)', async () => {
    let resolveFirst!: (v: Show) => void
    let resolveSecond!: (v: Show) => void

    getShowMock
      .mockImplementationOnce(() => new Promise<Show>((r) => (resolveFirst = r)))
      .mockImplementationOnce(() => new Promise<Show>((r) => (resolveSecond = r)))

    const showId = ref(1)
    const { show, isLoading } = useShowDetails(showId)

    await nextTick()
    expect(isLoading.value).toBe(true)

    // Trigger a second request before the first resolves
    showId.value = 2
    await nextTick()

    resolveSecond(makeShow({ id: 2, name: 'Second' }))
    await Promise.resolve()

    resolveFirst(makeShow({ id: 1, name: 'First (stale)' }))
    await Promise.resolve()

    expect(getShowMock).toHaveBeenNthCalledWith(1, 1)
    expect(getShowMock).toHaveBeenNthCalledWith(2, 2)
    expect(show.value?.id).toBe(2)
    expect(show.value?.name).toBe('Second')
    expect(isLoading.value).toBe(false)
  })

  test('accepts a computed showId', async () => {
    getShowMock.mockResolvedValue(makeShow({ id: 9, name: 'Computed' }))

    const raw = ref('9')
    const id = computed(() => Number(raw.value))

    const { show } = useShowDetails(id)

    await nextTick()
    await Promise.resolve()

    expect(getShowMock).toHaveBeenCalledWith(9)
    expect(show.value?.name).toBe('Computed')
  })
})
