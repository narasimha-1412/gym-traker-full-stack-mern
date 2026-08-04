import { defineStore } from 'pinia'
import { setAccessToken } from '@/networks/base/accessToken'
import { refresh, me, logout as logoutRequest } from '@/networks/auth.services'
import { getData } from '@/networks/base/envelope'

const LIMITS_KEY = 'ironlog.limits'
const LIMIT_MIN = 1
const LIMIT_MAX = 100

const emptyUser = () => ({
  name: '',
  email: '',
  avatar: '',
  role: 'user',
  status: 'active',
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

function readStoredLimits() {
  try {
    const raw = localStorage.getItem(LIMITS_KEY)
    if (!raw) return defaultLimits()
    return normalizeLimits(JSON.parse(raw))
  } catch {
    return defaultLimits()
  }
}

function writeStoredLimits(limits) {
  localStorage.setItem(LIMITS_KEY, JSON.stringify(limits))
}

export const useAppStore = defineStore('app', {
  state: () => ({
    loggedIn: false,
    accessToken: null,
    bootstrapped: false,
    user: emptyUser(),
    weightUnit: 'kg', // kg | lb
    limits: readStoredLimits(),
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
      writeStoredLimits(this.limits)
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
