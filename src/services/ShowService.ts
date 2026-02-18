import axios from 'axios'

import type { SearchResult, Show } from '@/types'

const apiClient = axios.create({
  baseURL: 'https://api.tvmaze.com',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

async function getShowsPage(page = 0): Promise<Show[]> {
  const { data } = await apiClient.get<Show[]>('/shows', { params: { page } })
  return data
}

async function searchShows(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const { data } = await apiClient.get<SearchResult[]>('/search/shows', {
    params: { q: query },
    signal,
  })
  return data
}

async function getShow(id: number): Promise<Show> {
  const { data } = await apiClient.get<Show>(`/shows/${id}`)
  return data
}

export default {
  getShowsPage,
  searchShows,
  getShow,
}
