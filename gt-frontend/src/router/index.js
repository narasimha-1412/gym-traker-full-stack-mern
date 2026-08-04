import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app.store'

import LoginPage from '@/pages/login/LoginPage.vue'
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'
import WorkoutPage from '@/pages/workout/WorkoutPage.vue'
import SettingsPage from '@/pages/settings/SettingsPage.vue'
import UsersPage from '@/pages/users/UsersPage.vue'

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
      path: '/users',
      name: 'users',
      component: UsersPage,
      meta: { auth: true, admin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(to => {
  const app = useAppStore()

  if (app.loggedIn && app.user.status === 'disabled') {
    app.clearSession()
    if (to.name !== 'login') return { name: 'login' }
  }

  if (to.meta.auth && !app.loggedIn) {
    return { name: 'login' }
  }

  if (to.meta.guest && app.loggedIn) {
    return { name: 'dashboard' }
  }

  if (to.meta.admin && !app.isAdmin) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
