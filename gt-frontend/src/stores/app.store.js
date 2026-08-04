import { defineStore } from 'pinia'
import { setAccessToken } from '@/networks/base/accessToken'
import { refresh, me, logout as logoutRequest } from '@/networks/auth.services'
import { getData } from '@/networks/base/envelope'

const emptyUser = () => ({
  name: '',
  email: '',
  avatar: '',
  role: 'user',
  status: 'active',
})

export const useAppStore = defineStore('app', {
  state: () => ({
    loggedIn: false,
    accessToken: null,
    bootstrapped: false,
    user: emptyUser(),
    weightUnit: 'kg', // kg | lb
  }),

  getters: {
    isAdmin: s => s.user?.role === 'admin',
  },

  actions: {
    goLogin() {
      this.router.push({ name: 'login' })
    },

    goDashboard() {
      this.router.push({ name: 'dashboard' })
    },

    goSettings() {
      this.router.push({ name: 'settings' })
    },

    goUsers() {
      this.router.push({ name: 'users' })
    },

    openWorkout(id) {
      this.router.push({ name: 'workout', params: { routineId: String(id) } })
    },

    setWeightUnit(unit) {
      if (unit === 'kg' || unit === 'lb') this.weightUnit = unit
    },

    updateProfile({ name, weightUnit }) {
      const trimmed = name?.trim() || ''
      if (trimmed) {
        this.user.name = trimmed
        this.user.avatar = trimmed.charAt(0).toUpperCase()
      }
      this.setWeightUnit(weightUnit)
    },

    setAccessToken(token) {
      this.accessToken = token || null
      setAccessToken(this.accessToken)
    },

    clearSession() {
      this.setAccessToken(null)
      this.loggedIn = false
      this.user = emptyUser()
      this.weightUnit = 'kg'
    },

    loginSession(user, accessToken) {
      this.setAccessToken(accessToken)
      this.loggedIn = true
      this.user = {
        name: user.name || '',
        email: user.email || '',
        avatar: (user.name || '').charAt(0).toUpperCase(),
        role: user.role || 'user',
        status: user.status || 'active',
      }
      this.setWeightUnit(user.weightUnit || 'kg')
    },

    async bootstrap() {
      if (this.bootstrapped) return
      try {
        const refreshData = getData(await refresh())
        this.setAccessToken(refreshData.accessToken)
        const meData = getData(await me())
        this.loginSession(meData.user, refreshData.accessToken)
      } catch {
        this.clearSession()
      } finally {
        this.bootstrapped = true
      }
    },

    async logout() {
      try {
        await logoutRequest()
      } catch {
        // still clear local session
      } finally {
        this.clearSession()
        this.goLogin()
      }
    },

    resetSession() {
      this.clearSession()
      this.goLogin()
    },
  },
})
