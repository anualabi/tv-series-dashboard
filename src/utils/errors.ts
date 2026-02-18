import axios from 'axios'

export function toUserMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  // Axios-specific error (timeouts, non-2xx, aborts, etc.)
  if (axios.isAxiosError(error)) {
    // Request cancelled
    if (error.code === 'ERR_CANCELED') return 'Request cancelled.'

    // If server returned something useful
    const status = error.response?.status
    if (status === 404) return 'Not found.'
    if (status && status >= 500) return 'Server error. Please try again.'
    if (status && status >= 400) return 'Request failed. Please try again.'
  }

  // Generic JS error
  if (error instanceof Error && error.message) return error.message

  return fallback
}

export function isRequestCancelled(error: unknown) {
  return axios.isAxiosError(error) && error.code === 'ERR_CANCELED'
}
