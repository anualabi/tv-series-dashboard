import { describe, expect, test, vi } from 'vitest'

vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn(),
  },
}))

import axios from 'axios'
import { isRequestCancelled, toUserMessage } from '@/utils/errors'

const isAxiosError = vi.mocked(axios.isAxiosError)

type Axiosish = { code?: string; response?: { status?: number } }

describe('errors utils', () => {
  test('returns fallback by default', () => {
    isAxiosError.mockReturnValue(false)
    expect(toUserMessage({})).toBe('Something went wrong. Please try again.')
    expect(toUserMessage({}, 'Custom fallback')).toBe('Custom fallback')
  })

  test('returns Error.message for generic errors', () => {
    isAxiosError.mockReturnValue(false)
    expect(toUserMessage(new Error('Boom'))).toBe('Boom')
  })

  test('maps axios cancel to "Request cancelled."', () => {
    isAxiosError.mockReturnValue(true)
    expect(toUserMessage({ code: 'ERR_CANCELED' } as Axiosish)).toBe('Request cancelled.')
    expect(isRequestCancelled({ code: 'ERR_CANCELED' } as Axiosish)).toBe(true)
  })

  test('maps axios status codes to friendly messages', () => {
    isAxiosError.mockReturnValue(true)

    expect(toUserMessage({ response: { status: 404 } } as Axiosish)).toBe('Not found.')
    expect(toUserMessage({ response: { status: 500 } } as Axiosish)).toBe(
      'Server error. Please try again.',
    )
    expect(toUserMessage({ response: { status: 429 } } as Axiosish)).toBe(
      'Request failed. Please try again.',
    )
  })

  test('isRequestCancelled is false for non-axios errors / other codes', () => {
    isAxiosError.mockReturnValue(false)
    expect(isRequestCancelled(new Error('x'))).toBe(false)

    isAxiosError.mockReturnValue(true)
    expect(isRequestCancelled({ code: 'ERR_BAD_REQUEST' } as Axiosish)).toBe(false)
  })
})
