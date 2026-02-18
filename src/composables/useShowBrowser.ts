import { computed, onMounted, ref, watch } from 'vue'
import type { Show } from '@/types'
import ShowService from '@/services/ShowService'
import { groupShowsByGenre } from '@/utils/shows'
import { toUserMessage, isRequestCancelled } from '@/utils/errors'

type UseShowBrowserOptions = {
  page?: number
  minQueryLength?: number
  debounceMs?: number
}

export function useShowBrowser(options: UseShowBrowserOptions = {}) {
  const page = ref(options.page ?? 0)
  const minQueryLength = options.minQueryLength ?? 2
  const debounceMs = options.debounceMs ?? 500

  // dashboard data
  const shows = ref<Show[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // search state
  const query = ref('')
  const searchedShows = ref<Show[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)
  const appliedQuery = ref('')

  const isSearchMode = computed(() => query.value.trim().length >= minQueryLength)

  const activeShows = computed(() => {
    const q = query.value.trim()

    if (!q) return shows.value

    // Keep previous search results until new ones arrive
    if (searchedShows.value.length > 0 || appliedQuery.value) return searchedShows.value

    // First search in-flight: keep dashboard
    return shows.value
  })

  const genreEntries = computed(() => {
    const map = groupShowsByGenre(activeShows.value)
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  })

  const showNoResults = computed(() => {
    const q = query.value.trim()
    return (
      q.length >= minQueryLength &&
      !isSearching.value &&
      !searchError.value &&
      appliedQuery.value === q && // important: only "no results" for latest completed query
      searchedShows.value.length === 0
    )
  })

  let debounceTimer: number | undefined
  let controller: AbortController | null = null

  async function loadInitial() {
    try {
      isLoading.value = true
      errorMessage.value = null

      const data = await ShowService.getShowsPage(page.value)
      shows.value = data
    } catch (error) {
      errorMessage.value = toUserMessage(error, 'Failed to load shows. Please try again.')
    } finally {
      isLoading.value = false
    }
  }

  async function runSearch(raw: string) {
    const trimmed = raw.trim()

    // Clear search => back to dashboard
    if (!trimmed) {
      controller?.abort()
      controller = null

      searchedShows.value = []
      appliedQuery.value = ''
      searchError.value = null
      isSearching.value = false
      return
    }

    // Below min length => keep previous results; treat as "not executed"
    if (trimmed.length < minQueryLength) {
      controller?.abort()
      controller = null
      isSearching.value = false
      searchError.value = null
      return
    }

    controller?.abort()
    controller = new AbortController()
    function isAbortError(err: unknown): boolean {
      if (!(err instanceof Error)) return false

      // axios v1 cancellation typically has code "ERR_CANCELED"
      const code = (err as { code?: string }).code
      return err.name === 'CanceledError' || code === 'ERR_CANCELED'
    }

    try {
      isSearching.value = true
      searchError.value = null

      const data = await ShowService.searchShows(trimmed, controller.signal)
      searchedShows.value = data.map((r) => r.show)
      appliedQuery.value = trimmed
    } catch (err: unknown) {
      if (isRequestCancelled(err)) return
      searchError.value = toUserMessage(err, 'Search failed. Please try again.')
    } finally {
      isSearching.value = false
    }
  }

  watch(query, (val) => {
    window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => {
      void runSearch(val)
    }, debounceMs)
  })

  onMounted(loadInitial)

  function clearSearch() {
    window.clearTimeout(debounceTimer)
    controller?.abort()
    controller = null

    query.value = ''
    searchedShows.value = []
    appliedQuery.value = ''
    searchError.value = null
    isSearching.value = false
  }

  return {
    // state
    query,
    isSearchMode,
    isLoading,
    errorMessage,
    isSearching,
    searchError,
    showNoResults,

    // data
    activeShows,
    genreEntries,

    // actions
    clearSearch,
    loadInitial, // exposed for tests
    runSearch, // exposed for tests
  }
}
