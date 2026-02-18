<script setup lang="ts">
import ShowCard from '@/components/ShowCard.vue'
import { useShowBrowser } from '@/composables/useShowBrowser'

const {
  query,
  isSearchMode,
  isLoading,
  errorMessage,
  isSearching,
  searchError,
  showNoResults,
  genreEntries,
  clearSearch,
} = useShowBrowser({ debounceMs: 500, minQueryLength: 2, page: 0 })
</script>

<template>
  <main>
    <header class="header">
      <h1 class="title">TV Shows</h1>

      <div class="search">
        <input
          id="show-search"
          v-model="query"
          type="search"
          placeholder="Search by show name…"
          autocomplete="off"
          aria-label="Search shows"
        />
        <button v-if="query" class="clear" @click="clearSearch" aria-label="Clear search">×</button>
      </div>

      <p v-if="isSearchMode" class="search-meta">
        <span v-if="isSearching">Searching…</span>
        <span v-else-if="searchError">{{ searchError }}</span>
        <span v-else-if="showNoResults">No results for “{{ query }}”.</span>
        <span v-else>Showing results for “{{ query }}”</span>
      </p>
    </header>

    <div
      v-if="!isSearchMode && isLoading"
      class="skeleton-page"
      aria-busy="true"
      aria-live="polite"
    >
      <section class="genre-section" v-for="n in 3" :key="n">
        <div class="title-bar skeleton" aria-hidden="true"></div>
        <div class="row">
          <div v-for="i in 8" :key="i" class="card-skeleton skeleton" aria-hidden="true"></div>
        </div>
      </section>
    </div>

    <p v-else-if="!isSearchMode && errorMessage">{{ errorMessage }}</p>

    <template v-else>
      <section v-for="[genre, list] in genreEntries" :key="genre" class="genre-section">
        <h2>{{ genre }}</h2>
        <div class="row">
          <ShowCard v-for="show in list.slice(0, 12)" :key="show.id" :show="show" />
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
main {
  padding: 16px;
}

.header {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.title {
  margin: 0;
}

.search {
  position: relative;
  display: flex;
  align-items: center;
}

.search input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
}

.search input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.search input::-webkit-search-decoration,
.search input::-webkit-search-results-button,
.search input::-webkit-search-results-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

.clear {
  position: absolute;
  right: 8px;
  height: 28px;
  width: 28px;
  border-radius: 999px;
  border: 0;
  background: rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.genre-section {
  margin: 16px 0 24px;
}

.row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 12px 12px 0px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-padding-left: 12px;
}

.row > * {
  scroll-snap-align: start;
}

.search-meta {
  margin-bottom: 12px;
  opacity: 0.9;
}

.skeleton-page {
  display: grid;
  gap: 16px;
}

.title-bar {
  height: 18px;
  width: 160px;
  margin: 10px 0;
}

.card-skeleton {
  width: clamp(132px, 40vw, 180px);
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  flex: 0 0 auto;
}
</style>
