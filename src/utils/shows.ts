import type { Show } from '@/types'

export function ratingValue(show: Show): number {
  return show.rating?.average ?? 0
}

export function groupShowsByGenre(shows: Show[]) {
  const map: Record<string, Show[]> = {}

  for (const show of shows) {
    const genres = show.genres?.length ? show.genres : ['Other']
    for (const genre of genres) {
      ;(map[genre] ??= []).push(show)
    }
  }

  for (const genre of Object.keys(map)) {
    map[genre]?.sort((a, b) => ratingValue(b) - ratingValue(a))
  }

  return map
}
