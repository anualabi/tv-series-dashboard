<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Show } from '@/types'

const props = defineProps<{
  show: Show
}>()

const rating = computed(() => props.show.rating?.average ?? null)
const ratingText = computed(() => (rating.value == null ? '—' : rating.value.toFixed(1)))

const imgSrc = computed(() => props.show.image?.medium ?? '')
const imgError = ref(false)

watch(imgSrc, () => {
  imgError.value = false
})
</script>

<template>
  <article class="show-card">
    <div class="thumb">
      <img
        v-if="imgSrc && !imgError"
        :src="imgSrc"
        :alt="`${show.name} poster`"
        loading="lazy"
        decoding="async"
        @error="imgError = true"
      />
      <div v-else class="thumb-fallback" aria-hidden="true">No image</div>
    </div>

    <div class="meta">
      <div class="top">
        <span class="type">{{ show.type }}</span>
        <span class="rating" :aria-label="rating == null ? 'No rating' : `Rating ${ratingText}`">
          ★ {{ ratingText }}
        </span>
      </div>
      <p class="name">{{ show.name }}</p>
    </div>
  </article>
</template>

<style scoped>
.show-card {
  width: clamp(132px, 40vw, 180px);
  flex: 0 0 auto;
  border-radius: 12px;
  padding: 6px;
  transition:
    transform 120ms ease,
    background-color 120ms ease;
}

@media (hover: hover) {
  .show-link:hover .show-card {
    transform: translateY(-2px);
    background: rgba(0, 0, 0, 0.03);
  }
}

.show-link:active .show-card {
  transform: translateY(0);
  background: rgba(0, 0, 0, 0.05);
}

@media (prefers-reduced-motion: reduce) {
  .show-card {
    transition: none;
  }
}

.thumb {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 12px;
  opacity: 0.7;
}

.meta {
  margin-top: 8px;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  opacity: 0.9;
}

.name {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.type,
.rating {
  white-space: nowrap;
}

.type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  opacity: 0.95;
}
</style>
