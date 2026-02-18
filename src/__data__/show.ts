/**
 * Test data factory for `Show`.
 *
 * Purpose:
 * - Provides a strongly-typed `makeShow()` helper to generate valid `Show` objects for unit tests.
 * - Allows ergonomic overrides (including nested objects) while guaranteeing the final shape matches `Show`
 *   (e.g. `genres`/`schedule.days` are always `string[]`, nested `network.name` is always `string`).
 * - Centralises mock defaults to reduce duplication across test suites.
 */
import type { Show } from '@/types'

type ShowOverrides = Partial<Omit<Show, 'schedule' | 'rating' | 'image' | 'network'>> & {
  schedule?: Partial<Show['schedule']>
  rating?: Partial<Show['rating']>
  image?: Show['image'] | Partial<NonNullable<Show['image']>>
  network?: Show['network'] | Partial<NonNullable<Show['network']>>
}

export const makeShow = (overrides: ShowOverrides = {}): Show => {
  const base: Show = {
    id: 1,
    name: 'Sample Show',
    url: 'https://example.com',
    type: 'Scripted',
    language: 'English',
    genres: [],
    status: 'Running',
    runtime: null,
    averageRuntime: null,
    premiered: null,
    ended: null,
    officialSite: null,
    schedule: { time: '', days: [] },
    network: null,
    rating: { average: null },
    image: null,
    summary: null,
  }

  const schedule: Show['schedule'] = {
    ...base.schedule,
    ...(overrides.schedule ?? {}),
    days: (overrides.schedule?.days ?? base.schedule.days).filter(
      (d): d is string => typeof d === 'string',
    ),
  }

  const rating: Show['rating'] = {
    ...base.rating,
    ...(overrides.rating ?? {}),
  }

  const network: Show['network'] =
    overrides.network === null
      ? null
      : overrides.network
        ? { name: overrides.network.name ?? 'Network' }
        : base.network

  const image: Show['image'] =
    overrides.image === null
      ? null
      : overrides.image
        ? {
            medium: 'm.jpg',
            original: 'o.jpg',
            ...(overrides.image as Partial<NonNullable<Show['image']>>),
          }
        : base.image

  return {
    ...base,
    ...overrides,
    schedule,
    rating,
    network,
    image,
    genres: (overrides.genres ?? base.genres).filter((g): g is string => typeof g === 'string'),
  }
}
