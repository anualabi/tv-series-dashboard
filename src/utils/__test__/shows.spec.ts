import { describe, expect, test } from 'vitest'

import { groupShowsByGenre, ratingValue } from '@/utils/shows'
import { makeShow } from '@/__data__/show'

describe('utils/shows', () => {
  test('ratingValue returns average or 0', () => {
    expect(ratingValue(makeShow({ rating: { average: 8.5 } }))).toBe(8.5)
    expect(ratingValue(makeShow({ rating: { average: null } }))).toBe(0)
  })

  test('groups by genre; uses "Other" when genres empty', () => {
    const a = makeShow({ id: 1, genres: ['Drama'] })
    const b = makeShow({ id: 2, genres: [] })
    const map = groupShowsByGenre([a, b])

    expect(map.Drama?.map((s) => s.id)).toEqual([1])
    expect(map.Other?.map((s) => s.id)).toEqual([2])
  })

  test('puts a show into multiple genres', () => {
    const s = makeShow({ id: 10, genres: ['Drama', 'Sci-Fi'] })
    const map = groupShowsByGenre([s])

    expect(map.Drama?.[0]?.id).toBe(10)
    expect(map['Sci-Fi']?.[0]?.id).toBe(10)
  })

  test('sorts each genre by rating descending (null treated as 0)', () => {
    const hi = makeShow({ id: 1, genres: ['Drama'], rating: { average: 9 } })
    const mid = makeShow({ id: 2, genres: ['Drama'], rating: { average: 6.5 } })
    const none = makeShow({ id: 3, genres: ['Drama'], rating: { average: null } })

    const map = groupShowsByGenre([mid, none, hi])
    expect(map.Drama?.map((s) => s.id)).toEqual([1, 2, 3])
  })
})
