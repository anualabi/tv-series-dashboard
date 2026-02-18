import { createRouter, createWebHistory } from 'vue-router'
import ShowListView from '@/views/ShowListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'show-list',
      component: ShowListView,
    },
  ],
})

export default router
