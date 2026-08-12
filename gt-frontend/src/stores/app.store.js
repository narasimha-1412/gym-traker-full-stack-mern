import { defineStore } from 'pinia'
import { setAccessToken } from '@/networks/base/accessToken'
import { refresh, me, logout as logoutRequest } from '@/networks/auth.services'
import { getConfig } from '@/networks/configs.services'
import { getData } from '@/networks/base/envelope'

const LIMIT_MIN = 1
const LIMIT_MAX = 100

const emptyUser = () => ({
  name: '',
  email: '',
  avatar: '',
  role: 'user',
  status: 'active',
  activeSplitId: null,
})

export function defaultLimits() {
  return {
    maxSplits: 20,
    maxWorkoutsPerSplit: 20,
    maxExercisesPerWorkout: 20,
  }
}

export function normalizeLimit(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(LIMIT_MAX, Math.max(LIMIT_MIN, Math.round(n)))
}

export function normalizeLimits(input = {}) {
  const defaults = defaultLimits()
  return {
    maxSplits: normalizeLimit(input.maxSplits, defaults.maxSplits),
    maxWorkoutsPerSplit: normalizeLimit(input.maxWorkoutsPerSplit, defaults.maxWorkoutsPerSplit),
    maxExercisesPerWorkout: normalizeLimit(
      input.maxExercisesPerWorkout,
      defaults.maxExercisesPerWorkout
    ),
  }
}

export const useAppStore = defineStore('app', {
  state: () => ({
    loggedIn: false,
    accessToken: null,
    bootstrapped: false,
    user: emptyUser(),
    limits: defaultLimits(),
  }),

  actions: {
    isAdmin() {
      return this.user?.role === 'admin'
    },

    getLimits() {
      return { ...this.limits }
    },

    setLimits(next) {
      this.limits = normalizeLimits(next)
    },

    setActiveSplitId(id) {
      this.user.activeSplitId = id || null
    },

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
      this.router.push({ name: 'workout', params: { workoutId: String(id) } })
    },

    updateProfile({ name }) {
      const trimmed = name?.trim() || ''
      if (trimmed) {
        this.user.name = trimmed
        this.user.avatar = trimmed.charAt(0).toUpperCase()
      }
    },

    setAccessToken(token) {
      this.accessToken = token || null
      setAccessToken(this.accessToken)
    },

    clearSession() {
      this.setAccessToken(null)
      this.loggedIn = false
      this.user = emptyUser()
      this.limits = defaultLimits()
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
        activeSplitId: user.activeSplitId || null,
      }
    },

    async loadLimits() {
      const data = getData(await getConfig())
      this.setLimits(data.config)
    },

    async bootstrap() {
      if (this.bootstrapped) return
      try {
        const refreshData = getData(await refresh())
        this.setAccessToken(refreshData.accessToken)
        const meData = getData(await me())
        this.loginSession(meData.user, refreshData.accessToken)
        try {
          await this.loadLimits()
        } catch {
          this.limits = defaultLimits()
        }
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
