import { defineStore } from 'pinia'
import { setAccessToken } from '@/networks/base/accessToken'
import { refresh, me, logout as logoutRequest } from '@/networks/auth.services'

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
    },

    clearSession() {
      this.setAccessToken(null)
      this.loggedIn = false
      this.user = emptyUser()
    },

    async bootstrap() {
      if (this.bootstrapped) return
      try {
        const { data } = await refresh()
        this.setAccessToken(data.accessToken)
        const meRes = await me()
        this.loginSession(meRes.data.user, data.accessToken)
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
