<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useShowDetails } from '@/composables/useShowDetails'
import { stripHtml } from '@/utils/text'

const props = defineProps<{ id: string }>()
const router = useRouter()

const showId = computed(() => Number(props.id))
const { show, isLoading, errorMessage } = useShowDetails(showId)

const summaryText = computed(() => (show.value?.summary ? stripHtml(show.value.summary) : ''))

function goBack() {
  router.back()
}
</script>

<template>
  <main class="details">
    <button class="back" type="button" @click="goBack">← Back</button>

    <div v-if="isLoading" class="content" aria-busy="true" aria-live="polite">
      <div class="poster skeleton" aria-hidden="true"></div>

      <div class="info">
        <div class="skeleton line title-line" aria-hidden="true"></div>
        <div class="skeleton line sub-line" aria-hidden="true"></div>

        <div class="genres" aria-hidden="true">
          <span class="skeleton chip"></span>
          <span class="skeleton chip"></span>
          <span class="skeleton chip"></span>
        </div>

        <div class="summary" aria-hidden="true">
          <div class="skeleton line"></div>
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
        </div>

        <div class="facts" aria-hidden="true">
          <div class="fact">
            <div class="skeleton line dt"></div>
            <div class="skeleton line dd"></div>
          </div>
          <div class="fact">
            <div class="skeleton line dt"></div>
            <div class="skeleton line dd"></div>
          </div>
          <div class="fact">
            <div class="skeleton line dt"></div>
            <div class="skeleton line dd"></div>
          </div>
          <div class="fact">
            <div class="skeleton line dt"></div>
            <div class="skeleton line dd"></div>
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <section v-else-if="show" class="content">
      <div class="poster">
        <img
          v-if="show.image?.original"
          :src="show.image.original"
          :alt="`${show.name} poster`"
          loading="lazy"
        />
        <div v-else class="poster-fallback" aria-hidden="true">No image</div>
      </div>

      <div class="info">
        <header class="header">
          <h1 class="title">{{ show.name }}</h1>
          <p class="sub">
            <span class="badge">{{ show.type }}</span>
            <span class="badge">{{ show.language }}</span>
            <span class="badge">★ {{ (show.rating?.average ?? 0).toFixed(1) }}</span>
          </p>
        </header>

        <div class="genres" v-if="show.genres?.length">
          <span v-for="g in show.genres" :key="g" class="chip">{{ g }}</span>
        </div>

        <p v-if="summaryText" class="summary">{{ summaryText }}</p>

        <dl class="facts">
          <div class="fact">
            <dt>Status</dt>
            <dd>{{ show.status }}</dd>
          </div>

          <div class="fact">
            <dt>Premiered</dt>
            <dd>{{ show.premiered ?? '—' }}</dd>
          </div>

          <div class="fact">
            <dt>Runtime</dt>
            <dd>{{ show.runtime ? `${show.runtime} min` : '—' }}</dd>
          </div>

          <div class="fact">
            <dt>Schedule</dt>
            <dd>
              {{ show.schedule?.days?.length ? show.schedule.days.join(', ') : '—' }}
              <span v-if="show.schedule?.time"> at {{ show.schedule.time }}</span>
            </dd>
          </div>

          <div class="fact" v-if="show.network?.name">
            <dt>Network</dt>
            <dd>{{ show.network.name }}</dd>
          </div>

          <div class="fact" v-if="show.officialSite">
            <dt>Official site</dt>
            <dd>
              <a :href="show.officialSite" target="_blank" rel="noopener noreferrer"> Visit </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </main>
</template>

<style scoped>
.details {
  padding: 12px;
  max-width: 1100px;
  margin: 0 auto;
}

@media (min-width: 480px) {
  .details {
    padding: 16px;
  }
}

.back {
  cursor: pointer;
  margin-bottom: 12px;
  padding: 4px 8px;
}

.content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.poster {
  width: min(320px, 100%);
  margin: 0 auto;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  overflow: hidden;
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  opacity: 0.7;
}

.header .title {
  margin: 0;
}

.sub {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 0;
}

.badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 10px;
}

.chip {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}

.summary {
  margin: 12px 0 18px;
  line-height: 1.55;
}

.facts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.fact dt {
  font-size: 12px;
  opacity: 0.7;
}

.fact dd {
  margin: 2px 0 0;
}

@media (min-width: 820px) {
  .content {
    grid-template-columns: 280px 1fr;
    gap: 20px;
    align-items: start;
  }

  .poster {
    width: 100%;
    margin: 0;
  }

  .facts {
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }
}

.skeleton.line {
  height: 12px;
  margin: 10px 0;
}

.skeleton.line.short {
  width: 70%;
}

.title-line {
  height: 22px;
  width: min(520px, 90%);
  margin-top: 0;
}

.sub-line {
  height: 14px;
  width: min(360px, 70%);
}

.skeleton.chip {
  display: inline-block;
  height: 22px;
  width: 72px;
  border-radius: 999px;
}

.skeleton.line.dt {
  height: 10px;
  width: 90px;
  margin: 0;
  opacity: 0.8;
}

.skeleton.line.dd {
  height: 12px;
  width: min(260px, 90%);
  margin: 6px 0 0;
}
</style>
