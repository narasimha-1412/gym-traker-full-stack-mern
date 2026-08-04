import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loggedIn: true,
    user: {
      name: 'Alex Rivera',
      email: 'alex@rivera.com',
      avatar: 'A',
      role: 'admin',
    },
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

    loginSession({ name, email, role } = {}) {
      this.loggedIn = true
      if (email) this.user.email = email
      if (name) {
        this.user.name = name
        this.user.avatar = name.charAt(0).toUpperCase()
      }
      if (role) this.user.role = role
    },

    resetSession() {
      this.loggedIn = false
      this.user.email = ''
      this.user.role = 'user'
      this.goLogin()
    },
  },
})
