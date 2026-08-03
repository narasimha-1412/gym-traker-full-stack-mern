import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loggedIn: true,
    user: { name: 'Alex Rivera', email: 'alex@rivera.com', avatar: 'A' },
    weightUnit: 'kg', // kg | lb
  }),

  actions: {
    goLogin() {
      this.router.push({ name: 'login' })
    },

    goSignup() {
      this.router.push({ name: 'signup' })
    },

    goForgot() {
      this.router.push({ name: 'forgot' })
    },

    goReset(token = 'demo-token') {
      this.router.push({ name: 'reset', params: { token } })
    },

    goDashboard() {
      this.router.push({ name: 'dashboard' })
    },

    goSettings() {
      this.router.push({ name: 'settings' })
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

    loginSession({ name, email } = {}) {
      this.loggedIn = true
      if (email) this.user.email = email
      if (name) {
        this.user.name = name
        this.user.avatar = name.charAt(0).toUpperCase()
      }
    },

    resetSession() {
      this.loggedIn = false
      this.user.email = ''
      this.goLogin()
    },
  },
})
