export interface Show {
  id: number
  name: string
  url: string
  type: string
  language: string
  genres: string[]
  status: string
  runtime: number | null
  averageRuntime: number | null
  premiered: string | null
  ended: string | null
  officialSite: string | null
  schedule: { time: string; days: string[] }
  network: { name: string } | null
  rating: { average: number | null }
  image: { medium: string; original: string } | null
  summary: string | null
}

export interface SearchResult {
  score: number
  show: Show
}
