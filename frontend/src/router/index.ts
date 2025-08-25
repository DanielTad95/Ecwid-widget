import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/pages/LandingPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: LandingPage,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsPage,
    },
  ],
})

export default router
