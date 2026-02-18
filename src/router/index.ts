import { createRouter, createWebHistory } from 'vue-router'

import ShowDetailsView from '@/views/ShowDetailsView.vue'
import ShowListView from '@/views/ShowListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'show-list',
      component: ShowListView,
    },
    {
      path: '/shows/:id',
      name: 'show-details',
      component: ShowDetailsView,
      props: true,
    },
  ],
})

export default router
