# TV Shows Dashboard (Vue 3 + TypeScript + Vite)

A responsive, mobile-first TV show dashboard built with **Vue 3 (Composition API)**, **TypeScript**, and **Vite**. It consumes the public **TVMaze API** to:

- browse shows in **horizontal genre rows**
- **group by genre** and **sort by rating**
- **search** shows by name (**debounced + cancellable**)
- view a **details** page per show

> TVMaze does not provide a dedicated “browse by genre” endpoint. This project uses the `/shows` index endpoint and groups/sorts client-side.

---

## Assignment coverage

- ✅ Dashboard grouped by genre and sorted by rating
- ✅ Details screen with comprehensive information
- ✅ Search by show name
- ✅ Clean code + reuse (services, composables, utils)
- ✅ Minimal scaffolding / dependencies
- ✅ Unit tests included

---

## Tech stack

- Vue 3 + Composition API
- TypeScript
- Vite
- Vue Router
- Axios
- Vitest + Vue Test Utils
- ESLint + Prettier

---

## Why Vue 3 + Composition API

- Logic is organised into **small, explicit units** via composables (reuse + testability).
- **Type-safe** end-to-end data flow with minimal runtime overhead.
- Avoids heavy state management for a small app (state is handled locally + via composables).

---

## Key architectural decisions

### 1) Typed service layer (data-only)

`src/services/ShowService.ts` returns **data** (not `AxiosResponse`). This:

- reduces boilerplate in composables/views
- makes mocking in tests simpler
- keeps networking concerns isolated

### 2) Composables own state + side effects

- `useShowBrowser` encapsulates dashboard behaviour: initial fetch, debounced search, request cancellation, derived UI state.
- `useShowDetails` encapsulates details behaviour: fetch by id + race-condition guard for rapid id changes.

Views stay mostly declarative and focused on rendering.

### 3) Centralised error mapping

`src/utils/errors.ts` converts unknown errors into user-friendly messages consistently and exposes `isRequestCancelled` for search cancellation.

### 4) UX + Accessibility

- Skeleton loaders to reduce perceived latency and layout shift.
- Accessible attributes: `aria-label`, `aria-busy`, `aria-live`.
- Keyboard-focus friendly interactions.
- Prefer `aria-label` where sufficient (instead of `sr-only`) to avoid layout/overflow issues.

---

## App behaviour

### Dashboard (`ShowListView`)

- Fetches shows from `/shows?page=0`.
- Groups shows by genre (fallback genre: **Other**) and sorts within each genre by rating.
- Search:
  - debounced (default **500ms**)
  - cancellable via `AbortController`
  - keeps previous results until new results arrive to reduce UI flicker

### Details (`ShowDetailsView`)

- Uses router `props: true` so `id` is passed as a prop (testable + decoupled from router APIs).
- Fetches show by id and renders details with graceful fallbacks.

---

## Project structure

- `src/views/`
  - `ShowListView.vue` — dashboard + search + skeleton loading
  - `ShowDetailsView.vue` — details + skeleton loading
- `src/components/`
  - `ShowCard.vue` — reusable show card component
- `src/composables/`
  - `useShowBrowser.ts` — browse/search logic
  - `useShowDetails.ts` — details fetch logic
- `src/services/`
  - `ShowService.ts` — TVMaze API client
- `src/utils/`
  - `errors.ts`, `shows.ts`, `text.ts`
- `src/__data__/`
  - `show.ts` — shared `makeShow()` test factory (consistent mock data across suites)

---

## Requirements

### Node / npm

- Developed with: **Node v22.12.0**, **npm 11.7.0**

---

## Setup

```bash
npm install
npm run dev
```
