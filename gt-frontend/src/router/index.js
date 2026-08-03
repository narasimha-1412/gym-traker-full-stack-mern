import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app.store'

import LoginPage from '@/pages/login/LoginPage.vue'
import SignupPage from '@/pages/signup/SignupPage.vue'
import ForgotPage from '@/pages/forgot/ForgotPage.vue'
import ResetPage from '@/pages/reset/ResetPage.vue'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'
import WorkoutPage from '@/pages/workout/WorkoutPage.vue'
import SettingsPage from '@/pages/settings/SettingsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { guest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupPage,
      meta: { guest: true },
    },
    {
      path: '/forgot',
      name: 'forgot',
      component: ForgotPage,
    },
    {
      path: '/reset/:token',
      name: 'reset',
      component: ResetPage,
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardPage,
      meta: { auth: true },
    },
    {
      path: '/workout/:routineId',
      name: 'workout',
      component: WorkoutPage,
      meta: { auth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage,
      meta: { auth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const app = useAppStore()

  if (to.meta.auth && !app.loggedIn) {
    return { name: 'login' }
  }

  if (to.meta.guest && app.loggedIn) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
