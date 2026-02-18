import { ref, watch, type Ref, type ComputedRef } from 'vue'
import ShowService from '@/services/ShowService'
import type { Show } from '@/types'
import { toUserMessage } from '@/utils/errors'

type MaybeRefNumber = Ref<number> | ComputedRef<number>

export function useShowDetails(showId: MaybeRefNumber) {
  const show = ref<Show | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // Guards against race conditions (e.g. route changes quickly)
  let requestId = 0

  async function fetchShow(id: number) {
    if (!Number.isFinite(id) || id <= 0) {
      errorMessage.value = 'Invalid show id.'
      show.value = null
      isLoading.value = false
      return
    }

    const current = ++requestId

    try {
      isLoading.value = true
      errorMessage.value = null

      const data = await ShowService.getShow(id)

      // Ignore stale responses
      if (current !== requestId) return

      show.value = data
    } catch (error) {
      // Ignore stale errors
      if (current !== requestId) return

      show.value = null
      errorMessage.value = toUserMessage(error, 'Failed to load show details. Please try again.')
    } finally {
      // Only the latest request controls loading state
      if (current === requestId) {
        isLoading.value = false
      }
    }
  }

  watch(
    showId,
    (id) => {
      void fetchShow(id)
    },
    { immediate: true },
  )

  return {
    show,
    isLoading,
    errorMessage,
    fetchShow,
  }
}
