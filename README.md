# TV Shows Dashboard (Vue 3 + TypeScript + Vite)

A responsive, mobile-first TV show dashboard built with **Vue 3 (Composition API)**, **TypeScript**, and **Vite**. It consumes the public **TVMaze API** to:

- browse shows in **horizontal genre rows**
- **group by genre** and **sort by rating**
- **search** shows by name (**debounced + cancellable**)
- view a **details** page per show

> TVMaze does not provide a dedicated “browse by genre” endpoint. This project uses the `/shows` index endpoint and groups/sorts client-side.

## Live demo

- **Deployed app:** https://tv-series-dashboard.vercel.app/

---

## Table of Contents

- [Overview](#overview)
- [Assignment coverage](#assignment-coverage)
- [Tech stack](#tech-stack)
- [Why Vue 3 + Composition API](#why-vue-3--composition-api)
- [Architecture](#architecture)
- [App behaviour](#app-behaviour)
- [Project structure](#project-structure)
- [Trade-offs](#trade-offs)
- [Requirements](#requirements)
- [Setup](#setup)
- [Scripts](#scripts)
- [Quality checks](#quality-checks)

---

## Overview

![screenshot](https://github.com/user-attachments/assets/d0803d9e-bdb6-443e-92f5-6ccdd66ccb56)

---

## Assignment coverage

- ✅ Dashboard grouped by genre and sorted by rating
- ✅ Details screen with comprehensive information
- ✅ Search by show name
- ✅ Clean code + reuse (services, composables, utils)
- ✅ Minimal dependencies / scaffolding
- ✅ Unit tests included

---

## Tech stack

- Vue 3 + Composition API
- TypeScript
- Vite
- Vue Router
- Axios
- Vitest + Vue Test Utils
- ESLint + Prettier (+ oxlint)

---

## Why Vue 3 + Composition API

- Aligns with ABN AMRO’s Vue preference and keeps the solution close to “real team code”.
- Composition API encourages **small, explicit units of logic** (composables) → better reuse and testability.
- Keeps state management lean: local view state + composables are sufficient (no heavy global state needed for this scope).

---

## Architecture

### Service layer (typed, data-only)

`src/services/ShowService.ts` returns **data** (not `AxiosResponse`) to:

- reduce boilerplate in composables/views
- simplify mocking in unit tests
- keep networking concerns isolated

### Composables own state + side effects

- `useShowBrowser`: initial fetch, debounced search, request cancellation, derived UI state.
- `useShowDetails`: fetch by id + race-condition guard for rapid id changes.

Views stay declarative and focused on rendering.

### Centralised error mapping

`src/utils/errors.ts` converts unknown errors into user-friendly messages consistently and exposes `isRequestCancelled` to ignore aborted searches.

### UX & accessibility

- Skeleton loaders to improve perceived performance and reduce layout shift.
- Accessible attributes: `aria-label`, `aria-busy`, `aria-live`.
- Keyboard-focus friendly interactions.
- Prefer `aria-label` where sufficient (instead of `sr-only`) to avoid layout/overflow issues.

### Minimal scaffolding

Kept the project intentionally small: no UI frameworks, no complex state libraries, and a thin set of utilities/composables to keep the codebase easy to reason about and test.

---

## App behaviour

### Dashboard (`ShowListView`)

- Fetches shows from `/shows?page=0`.
- Groups shows by genre (fallback: **Other**) and sorts within each genre by rating.
- Search:
  - debounced (default **500ms**)
  - cancellable via `AbortController`
  - retains previous results until new results arrive to avoid UI flicker

> TVMaze search results include a `score` per item. This implementation uses the returned order and maps to `result.show` (the score is available if you want to sort by relevance explicitly).

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
  - `show.ts` — shared `makeShow()` test factory

---

## Trade-offs

- Pagination is not implemented (initial load uses `/shows?page=0`).
- No “scroll left/right” buttons for each genre row (native horizontal scrolling is used).
- No E2E or snapshot tests (unit tests cover components/composables/services/utils).

---

## Requirements

- Developed with: **Node v22.12.0**, **npm 11.7.0**
- `package.json` engines: **Node 20.19+ or 22.12+**

---

## Setup

```bash
git clone https://github.com/anualabi/tv-series-dashboard.git
cd tv-series-dashboard
npm install
npm run dev
```
